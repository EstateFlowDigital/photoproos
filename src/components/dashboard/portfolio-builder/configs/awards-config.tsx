"use client";

interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  logoUrl: string | null;
}

interface AwardsConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function AwardsConfigForm({
  config,
  updateConfig,
}: AwardsConfigFormProps) {
  const title = (config.title as string) || "Awards & Recognition";
  const items = (config.items as AwardItem[]) || [];

  const addItem = () => {
    const newItem: AwardItem = {
      id: crypto.randomUUID(),
      title: "",
      issuer: "",
      year: null,
      logoUrl: null,
    };
    updateConfig({ items: [...items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<AwardItem>) => {
    updateConfig({
      items: items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const removeItem = (id: string) => {
    updateConfig({ items: items.filter((item) => item.id !== id) });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateConfig({ items: newItems });
  };

  return (
    <div className="space-y-5">
      {/* Section Title */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder="Awards & Recognition"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Award Items */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Awards
        </label>
        <p className="mt-1 text-xs text-foreground-muted">
          Add awards, certifications, or recognitions to display on your portfolio.
        </p>
        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder="Award name (e.g., Best Wedding Photographer)"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.issuer}
                      onChange={(e) => updateItem(item.id, { issuer: e.target.value })}
                      placeholder="Issuer (e.g., WPPI)"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="text"
                      value={item.year || ""}
                      onChange={(e) => updateItem(item.id, { year: e.target.value || null })}
                      placeholder="Year (e.g., 2024)"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <input
                    type="url"
                    value={item.logoUrl || ""}
                    onChange={(e) => updateItem(item.id, { logoUrl: e.target.value || null })}
                    placeholder="Logo URL (optional)"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="rounded p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                    className="rounded p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded p-1 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          <PlusIcon className="h-4 w-4" />
          Add Award
        </button>
      </div>

      {/* Tips */}
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
          <p className="text-sm text-foreground-muted">
            <strong className="text-foreground">Tip:</strong> Showcase your professional accomplishments.
            Add industry awards, certifications, or recognitions to build trust with potential clients.
          </p>
        </div>
      )}
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

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
