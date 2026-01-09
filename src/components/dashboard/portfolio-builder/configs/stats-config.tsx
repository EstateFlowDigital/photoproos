"use client";

import { useState, useId } from "react";

interface Stat {
  id: string;
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
}

interface StatsConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

const generateId = () => `stat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const STAT_ICONS = [
  { value: "camera", label: "📷 Camera" },
  { value: "home", label: "🏠 Home" },
  { value: "star", label: "⭐ Star" },
  { value: "calendar", label: "📅 Calendar" },
  { value: "users", label: "👥 Users" },
  { value: "trophy", label: "🏆 Trophy" },
  { value: "heart", label: "❤️ Heart" },
  { value: "check", label: "✓ Check" },
  { value: "clock", label: "⏰ Clock" },
  { value: "chart", label: "📈 Chart" },
];

const STAT_PRESETS = [
  { value: "500+", label: "Projects Completed", suffix: "" },
  { value: "10", label: "Years Experience", suffix: "+" },
  { value: "98", label: "Client Satisfaction", suffix: "%" },
  { value: "24", label: "Hour Turnaround", suffix: "hr" },
  { value: "5", label: "Star Rating", suffix: "★" },
  { value: "1000", label: "Happy Clients", suffix: "+" },
];

export function StatsConfig({ config, updateConfig }: StatsConfigProps) {
  const id = useId();
  const [stats, setStats] = useState<Stat[]>(
    (config.stats as Stat[]) || [
      { id: generateId(), value: "500", label: "Projects Completed", suffix: "+" },
      { id: generateId(), value: "10", label: "Years Experience", suffix: "+" },
      { id: generateId(), value: "98", label: "Client Satisfaction", suffix: "%" },
      { id: generateId(), value: "24", label: "Hour Turnaround", suffix: "hr" },
    ]
  );

  const updateStats = (newStats: Stat[]) => {
    setStats(newStats);
    updateConfig("stats", newStats);
  };

  const addStat = () => {
    const newStat: Stat = {
      id: generateId(),
      value: "100",
      label: "New Stat",
      suffix: "+",
    };
    updateStats([...stats, newStat]);
  };

  const addPreset = (preset: typeof STAT_PRESETS[number]) => {
    const newStat: Stat = {
      id: generateId(),
      value: preset.value,
      label: preset.label,
      suffix: preset.suffix,
    };
    updateStats([...stats, newStat]);
  };

  const updateStat = (statId: string, updates: Partial<Stat>) => {
    updateStats(
      stats.map((stat) =>
        stat.id === statId ? { ...stat, ...updates } : stat
      )
    );
  };

  const removeStat = (statId: string) => {
    updateStats(stats.filter((stat) => stat.id !== statId));
  };

  const moveStat = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === stats.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newStats = [...stats];
    [newStats[index], newStats[newIndex]] = [newStats[newIndex], newStats[index]];
    updateStats(newStats);
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
            Section Title (Optional)
          </label>
          <input
            id={`${id}-title`}
            type="text"
            value={(config.title as string) || ""}
            onChange={(e) => updateConfig("title", e.target.value)}
            placeholder="Why Choose Us"
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
            value={(config.layout as string) || "row"}
            onChange={(e) => updateConfig("layout", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="row">Horizontal Row</option>
            <option value="grid">Grid (2x2)</option>
            <option value="cards">Cards with Icons</option>
            <option value="compact">Compact Badges</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-style`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Number Style
          </label>
          <select
            id={`${id}-style`}
            value={(config.numberStyle as string) || "large"}
            onChange={(e) => updateConfig("numberStyle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="large">Large Numbers</option>
            <option value="animated">Animated Count-up</option>
            <option value="gradient">Gradient Text</option>
            <option value="outlined">Outlined</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDividers as boolean) ?? true}
            onChange={(e) => updateConfig("showDividers", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show dividers between stats</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showIcons as boolean) ?? false}
            onChange={(e) => updateConfig("showIcons", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show icons</span>
        </label>
      </div>

      {/* Quick Add Presets */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Quick Add</h4>
        <div className="flex flex-wrap gap-1.5">
          {STAT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => addPreset(preset)}
              className="rounded-full border border-[var(--card-border)] px-2.5 py-1 text-xs text-foreground-muted hover:border-[var(--primary)] hover:text-foreground"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground">Statistics</h4>
          <button
            type="button"
            onClick={addStat}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary)]/90"
          >
            + Add Stat
          </button>
        </div>

        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveStat(index, "up")}
                    disabled={index === 0}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStat(index, "down")}
                    disabled={index === stats.length - 1}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    {stat.prefix || ""}{stat.value}{stat.suffix || ""} {stat.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeStat(stat.id)}
                  className="text-xs text-[var(--error)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] text-foreground-muted">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={stat.prefix || ""}
                    onChange={(e) => updateStat(stat.id, { prefix: e.target.value })}
                    placeholder="$"
                    className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-foreground-muted">
                    Value
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(stat.id, { value: e.target.value })}
                    className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-foreground-muted">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={stat.suffix || ""}
                    onChange={(e) => updateStat(stat.id, { suffix: e.target.value })}
                    placeholder="+, %, etc"
                    className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-foreground-muted">
                    Icon
                  </label>
                  <select
                    value={stat.icon || ""}
                    onChange={(e) => updateStat(stat.id, { icon: e.target.value })}
                    className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-1 text-xs text-foreground"
                    aria-label="Select icon"
                  >
                    <option value="">None</option>
                    {STAT_ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <label className="mb-1 block text-[10px] text-foreground-muted">
                  Label
                </label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                  className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                />
              </div>
            </div>
          ))}

          {stats.length === 0 && (
            <p className="py-4 text-center text-sm text-foreground-muted">
              No stats added yet. Use quick add or click &quot;+ Add Stat&quot; to add your metrics.
            </p>
          )}
        </div>
      </div>

      {/* Background Settings */}
      <div className="space-y-4 border-t border-[var(--card-border)] pt-4">
        <h4 className="text-sm font-semibold text-foreground">Background</h4>

        <div>
          <label
            htmlFor={`${id}-bgStyle`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Background Style
          </label>
          <select
            id={`${id}-bgStyle`}
            value={(config.backgroundStyle as string) || "transparent"}
            onChange={(e) => updateConfig("backgroundStyle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="transparent">Transparent</option>
            <option value="subtle">Subtle Gray</option>
            <option value="dark">Dark</option>
            <option value="gradient">Gradient</option>
            <option value="image">Background Image</option>
          </select>
        </div>

        {(config.backgroundStyle as string) === "image" && (
          <div>
            <label
              htmlFor={`${id}-bgImage`}
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Background Image URL
            </label>
            <input
              id={`${id}-bgImage`}
              type="text"
              value={(config.backgroundImage as string) || ""}
              onChange={(e) => updateConfig("backgroundImage", e.target.value)}
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
            />
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Tip:</span> Statistics
          build trust with potential clients. Include metrics that showcase your
          experience, client satisfaction, and track record.
        </p>
      </div>
    </div>
  );
}
