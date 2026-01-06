"use client";

interface HeroConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function HeroConfig({ config, updateConfig }: HeroConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Layout</label>
        <select
          value={(config.layout as string) || "fullscreen"}
          onChange={(e) => updateConfig("layout", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="fullscreen">Fullscreen</option>
          <option value="split">Split (Images + Info)</option>
          <option value="contained">Contained</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showPrice as boolean) ?? true}
            onChange={(e) => updateConfig("showPrice", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Price</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showAddress as boolean) ?? true}
            onChange={(e) => updateConfig("showAddress", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Address</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showBadge as boolean) ?? true}
            onChange={(e) => updateConfig("showBadge", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Status Badge</span>
        </label>
      </div>

      {(config.showBadge as boolean) !== false && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Badge Text</label>
          <input
            type="text"
            value={(config.badgeText as string) || "For Sale"}
            onChange={(e) => updateConfig("badgeText", e.target.value)}
            placeholder="For Sale"
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Overlay Opacity ({Math.round(((config.overlayOpacity as number) || 0.4) * 100)}%)
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={(config.overlayOpacity as number) || 0.4}
          onChange={(e) => updateConfig("overlayOpacity", parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Image Count in Hero</label>
        <select
          value={(config.imageCount as number) || 5}
          onChange={(e) => updateConfig("imageCount", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value={1}>1 Image</option>
          <option value={3}>3 Images</option>
          <option value={5}>5 Images</option>
          <option value={7}>7 Images</option>
        </select>
      </div>

      <div className="border-t border-[var(--card-border)] pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">Call to Action</h4>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-foreground-muted">Button Text</label>
            <input
              type="text"
              value={(config.ctaText as string) || "Schedule a Tour"}
              onChange={(e) => updateConfig("ctaText", e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-foreground-muted">Button Link</label>
            <input
              type="text"
              value={(config.ctaLink as string) || "#inquiry"}
              onChange={(e) => updateConfig("ctaLink", e.target.value)}
              placeholder="#inquiry or https://..."
              className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
