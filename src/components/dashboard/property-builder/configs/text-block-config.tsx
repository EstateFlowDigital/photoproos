"use client";

interface TextBlockConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function TextBlockConfig({ config, updateConfig }: TextBlockConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Content</label>
        <textarea
          value={(config.content as string) || ""}
          onChange={(e) => updateConfig("content", e.target.value)}
          placeholder="Enter your text content here..."
          rows={6}
          className="w-full rounded-lg border border-[var(--card-border)] bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          You can use basic HTML tags for formatting (bold, italic, links)
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Text Alignment</label>
        <select
          value={(config.alignment as string) || "left"}
          onChange={(e) => updateConfig("alignment", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Max Width</label>
        <select
          value={(config.maxWidth as string) || "prose"}
          onChange={(e) => updateConfig("maxWidth", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="narrow">Narrow (600px)</option>
          <option value="prose">Standard (800px)</option>
          <option value="full">Full Width</option>
        </select>
      </div>
    </div>
  );
}
