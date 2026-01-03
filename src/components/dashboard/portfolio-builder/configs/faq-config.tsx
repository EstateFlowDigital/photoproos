"use client";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function FaqConfigForm({ config, updateConfig }: FaqConfigFormProps) {
  const title = (config.title as string) || "Frequently Asked Questions";
  const items = (config.items as FAQItem[]) || [];

  const addItem = () => {
    const newItem: FAQItem = {
      id: crypto.randomUUID(),
      question: "",
      answer: "",
    };
    updateConfig({ items: [...items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<FAQItem>) => {
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
          placeholder="Frequently Asked Questions"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* FAQ Items */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Questions & Answers
        </label>
        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateItem(item.id, { question: e.target.value })}
                    placeholder="What is your question?"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-[var(--primary)]"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                    placeholder="Your answer here..."
                    rows={3}
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
          Add Question
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
