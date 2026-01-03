"use client";

interface HeroConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function HeroConfigForm({ config, updateConfig }: HeroConfigFormProps) {
  const title = (config.title as string) || "";
  const subtitle = (config.subtitle as string) || "";
  const backgroundImageUrl = (config.backgroundImageUrl as string) || "";
  const backgroundVideoUrl = (config.backgroundVideoUrl as string) || "";
  const ctaText = (config.ctaText as string) || "Get in Touch";
  const ctaLink = (config.ctaLink as string) || "#contact";
  const overlay = (config.overlay as string) || "dark";
  const alignment = (config.alignment as string) || "center";

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Hero Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder="Your portfolio headline"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Subtitle
        </label>
        <textarea
          value={subtitle}
          onChange={(e) => updateConfig({ subtitle: e.target.value })}
          placeholder="A brief description of your work"
          rows={3}
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Background Image */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Background Image URL
        </label>
        <input
          type="url"
          value={backgroundImageUrl}
          onChange={(e) => updateConfig({ backgroundImageUrl: e.target.value || null })}
          placeholder="https://example.com/image.jpg"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Use a high-resolution image for best results (1920x1080 or larger)
        </p>
      </div>

      {/* Background Video */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Background Video URL{" "}
          <span className="text-foreground-muted">(optional)</span>
        </label>
        <input
          type="url"
          value={backgroundVideoUrl}
          onChange={(e) => updateConfig({ backgroundVideoUrl: e.target.value || null })}
          placeholder="https://example.com/video.mp4"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Video will replace the background image if provided
        </p>
      </div>

      {/* Overlay */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Overlay Style
        </label>
        <select
          value={overlay}
          onChange={(e) => updateConfig({ overlay: e.target.value })}
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
        >
          <option value="none">None</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Text Alignment
        </label>
        <div className="mt-2 flex gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => updateConfig({ alignment: align })}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                alignment === align
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Button Text
          </label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => updateConfig({ ctaText: e.target.value })}
            placeholder="Get in Touch"
            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Button Link
          </label>
          <input
            type="text"
            value={ctaLink}
            onChange={(e) => updateConfig({ ctaLink: e.target.value })}
            placeholder="#contact"
            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>
    </div>
  );
}
