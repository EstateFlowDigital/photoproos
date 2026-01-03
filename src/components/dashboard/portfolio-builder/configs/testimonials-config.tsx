"use client";

interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  photoUrl: string | null;
}

interface TestimonialsConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function TestimonialsConfigForm({
  config,
  updateConfig,
}: TestimonialsConfigFormProps) {
  const title = (config.title as string) || "What Clients Say";
  const items = (config.items as TestimonialItem[]) || [];
  const layout = (config.layout as string) || "cards";

  const addItem = () => {
    const newItem: TestimonialItem = {
      id: crypto.randomUUID(),
      quote: "",
      clientName: "",
      clientTitle: "",
      photoUrl: null,
    };
    updateConfig({ items: [...items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<TestimonialItem>) => {
    updateConfig({
      items: items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const removeItem = (id: string) => {
    updateConfig({ items: items.filter((item) => item.id !== id) });
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
          placeholder="What Clients Say"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Layout Style
        </label>
        <div className="mt-2 flex gap-2">
          {(["cards", "carousel", "list"] as const).map((layoutOption) => (
            <button
              key={layoutOption}
              type="button"
              onClick={() => updateConfig({ layout: layoutOption })}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                layout === layoutOption
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
              }`}
            >
              {layoutOption}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonial Items */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Testimonials
        </label>
        <div className="mt-3 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
            >
              <div className="space-y-3">
                <textarea
                  value={item.quote}
                  onChange={(e) => updateItem(item.id, { quote: e.target.value })}
                  placeholder="What the client said about your work..."
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={item.clientName}
                    onChange={(e) => updateItem(item.id, { clientName: e.target.value })}
                    placeholder="Client name"
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                  />
                  <input
                    type="text"
                    value={item.clientTitle}
                    onChange={(e) => updateItem(item.id, { clientTitle: e.target.value })}
                    placeholder="Title / Company (optional)"
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <input
                  type="url"
                  value={item.photoUrl || ""}
                  onChange={(e) => updateItem(item.id, { photoUrl: e.target.value || null })}
                  placeholder="Photo URL (optional)"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-[var(--error)]"
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
                </button>
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
          Add Testimonial
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
