"use client";

interface TextConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function TextConfigForm({ config, updateConfig }: TextConfigFormProps) {
  const content = (config.content as string) || "";
  const alignment = (config.alignment as string) || "left";

  return (
    <div className="space-y-5">
      {/* Content */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Text Content
        </label>
        <textarea
          value={content}
          onChange={(e) => updateConfig({ content: e.target.value })}
          placeholder="Enter your text content here..."
          rows={8}
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          You can use basic HTML for formatting (bold, italic, links)
        </p>
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
    </div>
  );
}
