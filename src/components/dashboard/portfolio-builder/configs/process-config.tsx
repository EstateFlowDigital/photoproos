"use client";

import { useState, useId } from "react";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

interface ProcessConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

const generateId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const STEP_ICONS = [
  { value: "phone", label: "📞 Phone" },
  { value: "calendar", label: "📅 Calendar" },
  { value: "camera", label: "📷 Camera" },
  { value: "edit", label: "✏️ Edit" },
  { value: "check", label: "✓ Check" },
  { value: "send", label: "📤 Send" },
  { value: "star", label: "⭐ Star" },
  { value: "home", label: "🏠 Home" },
  { value: "clock", label: "⏰ Clock" },
  { value: "document", label: "📄 Document" },
  { value: "chat", label: "💬 Chat" },
  { value: "heart", label: "❤️ Heart" },
];

const DEFAULT_STEPS: ProcessStep[] = [
  {
    id: generateId(),
    title: "Book Your Session",
    description: "Schedule your photography session online or give us a call. We will discuss your needs and confirm the details.",
    icon: "calendar",
  },
  {
    id: generateId(),
    title: "Photo Day",
    description: "Our professional photographer arrives on time with all the equipment needed to capture your property beautifully.",
    icon: "camera",
  },
  {
    id: generateId(),
    title: "Professional Editing",
    description: "Your photos are professionally edited to ensure perfect color, lighting, and composition.",
    icon: "edit",
  },
  {
    id: generateId(),
    title: "Delivery",
    description: "Receive your high-quality images within 24-48 hours via your private online gallery.",
    icon: "send",
  },
];

export function ProcessConfig({ config, updateConfig }: ProcessConfigProps) {
  const id = useId();
  const [steps, setSteps] = useState<ProcessStep[]>(
    (config.steps as ProcessStep[]) || DEFAULT_STEPS
  );

  const updateSteps = (newSteps: ProcessStep[]) => {
    setSteps(newSteps);
    updateConfig("steps", newSteps);
  };

  const addStep = () => {
    const newStep: ProcessStep = {
      id: generateId(),
      title: "New Step",
      description: "Describe this step in your process",
      icon: "check",
    };
    updateSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<ProcessStep>) => {
    updateSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  };

  const removeStep = (stepId: string) => {
    updateSteps(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    updateSteps(newSteps);
  };

  const resetToDefaults = () => {
    updateSteps(DEFAULT_STEPS.map((step) => ({ ...step, id: generateId() })));
  };

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Section Settings</h4>

        <div>
          <label
            htmlFor={`${id}-title`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Section Title
          </label>
          <input
            id={`${id}-title`}
            type="text"
            value={(config.title as string) || "How It Works"}
            onChange={(e) => updateConfig("title", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-subtitle`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Section Subtitle
          </label>
          <input
            id={`${id}-subtitle`}
            type="text"
            value={(config.subtitle as string) || "Our simple 4-step process"}
            onChange={(e) => updateConfig("subtitle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-layout`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Layout Style
          </label>
          <select
            id={`${id}-layout`}
            value={(config.layout as string) || "timeline"}
            onChange={(e) => updateConfig("layout", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="timeline">Timeline (Vertical)</option>
            <option value="horizontal">Horizontal Steps</option>
            <option value="cards">Cards Grid</option>
            <option value="numbered">Numbered List</option>
            <option value="alternating">Alternating (Zigzag)</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showNumbers as boolean) ?? true}
            onChange={(e) => updateConfig("showNumbers", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show step numbers</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showIcons as boolean) ?? true}
            onChange={(e) => updateConfig("showIcons", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show icons</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showConnectors as boolean) ?? true}
            onChange={(e) => updateConfig("showConnectors", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show connecting lines</span>
        </label>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Process Steps</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetToDefaults}
              className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={addStep}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary)]/90"
            >
              + Add Step
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, "down")}
                    disabled={index === steps.length - 1}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="text-xs text-[var(--error)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-foreground-muted">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">Icon</label>
                    <select
                      value={step.icon || ""}
                      onChange={(e) => updateStep(step.id, { icon: e.target.value })}
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-2 text-sm text-foreground"
                      aria-label="Select icon"
                    >
                      <option value="">None</option>
                      {STEP_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-foreground-muted">
                    Description
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                    className="h-20 w-full resize-none rounded-lg border border-[var(--card-border)] bg-background p-2 text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-foreground-muted">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={step.imageUrl || ""}
                    onChange={(e) => updateStep(step.id, { imageUrl: e.target.value })}
                    placeholder="https://... (optional illustration)"
                    className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                  />
                </div>
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <p className="py-4 text-center text-sm text-foreground-muted">
              No steps added yet. Click &quot;+ Add Step&quot; or &quot;Reset to Defaults&quot; to get started.
            </p>
          )}
        </div>
      </div>

      {/* CTA Settings */}
      <div className="space-y-4 border-t border-[var(--card-border)] pt-4">
        <h4 className="text-sm font-semibold text-foreground">Call to Action</h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showCta as boolean) ?? true}
            onChange={(e) => updateConfig("showCta", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show CTA button at bottom</span>
        </label>

        {(config.showCta as boolean) !== false && (
          <>
            <div>
              <label
                htmlFor={`${id}-ctaText`}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Button Text
              </label>
              <input
                id={`${id}-ctaText`}
                type="text"
                value={(config.ctaText as string) || "Get Started"}
                onChange={(e) => updateConfig("ctaText", e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor={`${id}-ctaLink`}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Button Link
              </label>
              <input
                id={`${id}-ctaLink`}
                type="text"
                value={(config.ctaLink as string) || "#contact"}
                onChange={(e) => updateConfig("ctaLink", e.target.value)}
                placeholder="#contact"
                className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
              />
            </div>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Tip:</span> A clear process
          section helps potential clients understand what to expect when working with
          you. Keep descriptions concise and action-oriented.
        </p>
      </div>
    </div>
  );
}
