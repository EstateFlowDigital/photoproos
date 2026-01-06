"use client";

interface CtaConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function CtaConfig({ config, updateConfig }: CtaConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          value={(config.title as string) || "Ready to See This Property?"}
          onChange={(e) => updateConfig("title", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Subtitle</label>
        <input
          type="text"
          value={(config.subtitle as string) || "Schedule a private showing today"}
          onChange={(e) => updateConfig("subtitle", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Button Text</label>
        <input
          type="text"
          value={(config.buttonText as string) || "Schedule Tour"}
          onChange={(e) => updateConfig("buttonText", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Button Link</label>
        <input
          type="text"
          value={(config.buttonLink as string) || "#inquiry"}
          onChange={(e) => updateConfig("buttonLink", e.target.value)}
          placeholder="#inquiry or https://..."
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Style</label>
        <select
          value={(config.style as string) || "banner"}
          onChange={(e) => updateConfig("style", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="banner">Banner (Full Width)</option>
          <option value="card">Card (Contained)</option>
          <option value="minimal">Minimal (Text Only)</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Background Style</label>
        <select
          value={(config.backgroundStyle as string) || "gradient"}
          onChange={(e) => updateConfig("backgroundStyle", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="gradient">Gradient</option>
          <option value="solid">Solid Color</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>
    </div>
  );
}
