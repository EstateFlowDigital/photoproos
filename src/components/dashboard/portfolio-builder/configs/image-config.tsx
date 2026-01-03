"use client";

interface ImageConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function ImageConfigForm({ config, updateConfig }: ImageConfigFormProps) {
  const url = (config.url as string) || "";
  const alt = (config.alt as string) || "";
  const caption = (config.caption as string) || "";
  const layout = (config.layout as string) || "contained";

  return (
    <div className="space-y-5">
      {/* Image URL */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Image URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => updateConfig({ url: e.target.value || null })}
          placeholder="https://example.com/image.jpg"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Alt Text
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => updateConfig({ alt: e.target.value })}
          placeholder="Describe the image for accessibility"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Helps with SEO and accessibility
        </p>
      </div>

      {/* Caption */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Caption{" "}
          <span className="text-foreground-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => updateConfig({ caption: e.target.value })}
          placeholder="Photo caption"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Layout Style
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            { value: "full", label: "Full Width", description: "Edge to edge" },
            { value: "contained", label: "Contained", description: "With padding" },
            { value: "float-left", label: "Float Left", description: "Text wraps right" },
            { value: "float-right", label: "Float Right", description: "Text wraps left" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateConfig({ layout: option.value })}
              className={`rounded-lg border p-3 text-left transition-colors ${
                layout === option.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--card-border)] hover:bg-[var(--background-hover)]"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  layout === option.value
                    ? "text-[var(--primary)]"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-foreground-muted">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {url && (
        <div>
          <label className="text-sm font-medium text-foreground">Preview</label>
          <div className="mt-2 overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
            <img
              src={url}
              alt={alt || "Preview"}
              className="max-h-48 w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
