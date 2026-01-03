"use client";

interface AboutConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function AboutConfigForm({ config, updateConfig }: AboutConfigFormProps) {
  const photoUrl = (config.photoUrl as string) || "";
  const title = (config.title as string) || "About Me";
  const content = (config.content as string) || "";
  const highlights = (config.highlights as string[]) || [];

  const addHighlight = () => {
    updateConfig({ highlights: [...highlights, ""] });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    updateConfig({ highlights: newHighlights });
  };

  const removeHighlight = (index: number) => {
    updateConfig({ highlights: highlights.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder="About Me"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Photo URL
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => updateConfig({ photoUrl: e.target.value || null })}
          placeholder="https://example.com/photo.jpg"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          A professional headshot or portrait works best
        </p>
      </div>

      {/* Bio Content */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Bio / Description
        </label>
        <textarea
          value={content}
          onChange={(e) => updateConfig({ content: e.target.value })}
          placeholder="Tell visitors about yourself, your experience, and what makes your work unique..."
          rows={5}
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Highlights{" "}
          <span className="text-foreground-muted">(optional bullet points)</span>
        </label>
        <div className="mt-2 space-y-2">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                placeholder="e.g., 10+ years of experience"
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          <PlusIcon className="h-4 w-4" />
          Add Highlight
        </button>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
