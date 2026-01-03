"use client";

interface VideoConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function VideoConfigForm({ config, updateConfig }: VideoConfigFormProps) {
  const url = (config.url as string) || "";
  const autoplay = config.autoplay === true;
  const loop = config.loop === true;
  const muted = config.muted !== false;

  // Detect video type
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");
  const isEmbed = isYouTube || isVimeo;

  return (
    <div className="space-y-5">
      {/* Video URL */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Video URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Supports YouTube, Vimeo, or direct video file URLs (.mp4)
        </p>
      </div>

      {/* Video Type Indicator */}
      {url && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isYouTube
                ? "bg-red-500/10 text-red-400"
                : isVimeo
                ? "bg-blue-500/10 text-blue-400"
                : "bg-[var(--background-secondary)] text-foreground-muted"
            }`}
          >
            {isYouTube ? "YouTube" : isVimeo ? "Vimeo" : "Direct Video"}
          </span>
        </div>
      )}

      {/* Playback Options */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Playback Options
        </label>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => updateConfig({ autoplay: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Autoplay</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => updateConfig({ loop: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Loop video</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={muted}
              onChange={(e) => updateConfig({ muted: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Start muted</span>
          </label>
        </div>
        {autoplay && !muted && (
          <p className="mt-2 text-xs text-[var(--warning)]">
            Note: Most browsers require videos to be muted for autoplay to work.
          </p>
        )}
      </div>
    </div>
  );
}
