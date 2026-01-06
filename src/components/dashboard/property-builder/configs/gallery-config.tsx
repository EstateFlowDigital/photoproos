"use client";

interface GalleryConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function GalleryConfig({ config, updateConfig }: GalleryConfigProps) {
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
          <option value="masonry">Masonry</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Columns</label>
        <select
          value={(config.columns as number) || 3}
          onChange={(e) => updateConfig("columns", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
          <option value={5}>5 Columns</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Aspect Ratio</label>
        <select
          value={(config.aspectRatio as string) || "4:3"}
          onChange={(e) => updateConfig("aspectRatio", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="1:1">Square (1:1)</option>
          <option value="4:3">Standard (4:3)</option>
          <option value="16:9">Widescreen (16:9)</option>
          <option value="original">Original</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Max Images</label>
        <input
          type="number"
          value={(config.maxImages as number) || ""}
          onChange={(e) => updateConfig("maxImages", e.target.value ? parseInt(e.target.value) : null)}
          placeholder="All images"
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
        <p className="mt-1 text-xs text-foreground-muted">Leave empty to show all images</p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.enableLightbox as boolean) ?? true}
            onChange={(e) => updateConfig("enableLightbox", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Enable Lightbox</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showCaptions as boolean) ?? false}
            onChange={(e) => updateConfig("showCaptions", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Captions</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showViewAll as boolean) ?? true}
            onChange={(e) => updateConfig("showViewAll", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show "View All" Button</span>
        </label>
      </div>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Photos are automatically loaded from your property gallery.
        </p>
      </div>
    </div>
  );
}
