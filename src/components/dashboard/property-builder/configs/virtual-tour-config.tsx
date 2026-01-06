"use client";

interface VirtualTourConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
  sectionType: string;
}

export function VirtualTourConfig({ config, updateConfig, sectionType }: VirtualTourConfigProps) {
  const isVideoTour = sectionType === "video_tour";

  return (
    <div className="space-y-4">
      {!isVideoTour && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Provider</label>
          <select
            value={(config.provider as string) || "auto"}
            onChange={(e) => updateConfig("provider", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="auto">Auto-detect</option>
            <option value="matterport">Matterport</option>
            <option value="iguide">iGuide</option>
            <option value="zillow">Zillow 3D Home</option>
            <option value="custom">Custom Embed</option>
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Height</label>
        <select
          value={(config.height as string) || "600px"}
          onChange={(e) => updateConfig("height", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="400px">Small (400px)</option>
          <option value="500px">Medium (500px)</option>
          <option value="600px">Large (600px)</option>
          <option value="700px">Extra Large (700px)</option>
          <option value="100vh">Full Screen</option>
        </select>
      </div>

      {isVideoTour && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Aspect Ratio</label>
          <select
            value={(config.aspectRatio as string) || "16:9"}
            onChange={(e) => updateConfig("aspectRatio", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="16:9">Widescreen (16:9)</option>
            <option value="4:3">Standard (4:3)</option>
            <option value="1:1">Square (1:1)</option>
          </select>
        </div>
      )}

      <div className="space-y-3">
        {isVideoTour && (
          <>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.autoplay as boolean) ?? false}
                onChange={(e) => updateConfig("autoplay", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Autoplay</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.muted as boolean) ?? true}
                onChange={(e) => updateConfig("muted", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Muted by Default</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.loop as boolean) ?? false}
                onChange={(e) => updateConfig("loop", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Loop Video</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.showControls as boolean) ?? true}
                onChange={(e) => updateConfig("showControls", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Show Controls</span>
            </label>
          </>
        )}

        {!isVideoTour && (
          <>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.showFullscreenButton as boolean) ?? true}
                onChange={(e) => updateConfig("showFullscreenButton", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Show Fullscreen Button</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(config.autoStart as boolean) ?? false}
                onChange={(e) => updateConfig("autoStart", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">Auto-start Tour</span>
            </label>
          </>
        )}
      </div>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span>{" "}
          {isVideoTour ? "Video URL" : "Virtual tour URL"} is populated from your property details.
        </p>
      </div>
    </div>
  );
}
