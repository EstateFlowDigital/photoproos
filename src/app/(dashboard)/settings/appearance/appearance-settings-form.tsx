"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  updateAppearancePreferences,
  applyThemePreset,
  type AppearancePreferences,
  type ThemePreset,
} from "@/lib/actions/appearance";
import { useToast } from "@/components/ui/toast";

interface AppearanceSettingsFormProps {
  initialPreferences: AppearancePreferences;
  themePresets: ThemePreset[];
}

export function AppearanceSettingsForm({
  initialPreferences,
  themePresets,
}: AppearanceSettingsFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [customColor, setCustomColor] = useState(
    initialPreferences.dashboardTheme === "custom"
      ? initialPreferences.dashboardAccent
      : "#3b82f6"
  );

  const handleThemeSelect = (presetId: string) => {
    const preset = themePresets.find((p) => p.id === presetId);
    if (!preset) return;

    startTransition(async () => {
      const result = await applyThemePreset(presetId);
      if (result.success) {
        setPreferences({
          ...preferences,
          dashboardTheme: presetId,
          dashboardAccent: preset.accent,
        });
        showToast(`Theme changed to ${preset.name}`, "success");
        // Trigger a re-render of the page to apply the new theme
        window.location.reload();
      } else {
        showToast(result.error || "Failed to update theme", "error");
      }
    });
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
  };

  const handleCustomColorApply = () => {
    startTransition(async () => {
      const result = await updateAppearancePreferences({
        dashboardTheme: "custom",
        dashboardAccent: customColor,
      });
      if (result.success) {
        setPreferences({
          ...preferences,
          dashboardTheme: "custom",
          dashboardAccent: customColor,
        });
        showToast("Custom color applied", "success");
        window.location.reload();
      } else {
        showToast(result.error || "Failed to apply custom color", "error");
      }
    });
  };

  const handleCompactModeToggle = () => {
    startTransition(async () => {
      const newValue = !preferences.sidebarCompact;
      const result = await updateAppearancePreferences({
        sidebarCompact: newValue,
      });
      if (result.success) {
        setPreferences({ ...preferences, sidebarCompact: newValue });
        showToast(
          newValue ? "Compact mode enabled" : "Compact mode disabled",
          "success"
        );
      } else {
        showToast(result.error || "Failed to update setting", "error");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Theme Presets */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Color Themes
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Choose a color theme for your dashboard. This changes the accent color
          used for buttons, links, and highlights.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themePresets
            .filter((preset) => preset.id !== "custom")
            .map((preset) => {
              const isSelected = preferences.dashboardTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleThemeSelect(preset.id)}
                  disabled={isPending}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg"
                  )}
                >
                  {/* Color Preview */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-10 w-10 rounded-lg shadow-inner"
                      style={{ backgroundColor: preset.accent }}
                    />
                    <div
                      className="h-10 w-10 rounded-lg opacity-60"
                      style={{ backgroundColor: preset.preview.secondary }}
                    />
                  </div>

                  {/* Name and Description */}
                  <h3 className="font-medium text-foreground">{preset.name}</h3>
                  <p className="text-xs text-foreground-muted mt-1">
                    {preset.description}
                  </p>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckIcon className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Custom Color */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Custom Color
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Pick any color to use as your dashboard accent
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-14 h-10"
                />
                <div
                  className="h-10 w-14 rounded-lg border border-[var(--card-border)] cursor-pointer"
                  style={{ backgroundColor: customColor }}
                />
              </div>
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#3b82f6"
                className="w-28 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground uppercase"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomColorApply}
            disabled={isPending}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ backgroundColor: customColor }}
          >
            {isPending ? "Applying..." : "Apply Custom Color"}
          </button>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
          <p className="text-xs font-medium text-foreground-muted mb-3 uppercase tracking-wider">
            Preview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: customColor }}
            >
              Primary Button
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{
                borderColor: customColor,
                color: customColor,
              }}
            >
              Secondary Button
            </button>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${customColor}20`,
                color: customColor,
              }}
            >
              Badge
            </span>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm font-medium underline"
              style={{ color: customColor }}
            >
              Link Text
            </a>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Layout Options
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Customize how your dashboard is displayed
        </p>

        <div className="space-y-4">
          {/* Compact Sidebar Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
            <div>
              <h3 className="font-medium text-foreground">Compact Sidebar</h3>
              <p className="text-sm text-foreground-muted">
                Show only icons in the sidebar for more workspace
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.sidebarCompact}
              onClick={handleCompactModeToggle}
              disabled={isPending}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                preferences.sidebarCompact
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--background-hover)]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  preferences.sidebarCompact ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Theme Mode Reminder */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <InfoIcon className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">
              Light/Dark Mode
            </h3>
            <p className="text-sm text-foreground-muted mt-1">
              Toggle between light and dark mode using the theme button in the
              sidebar. Your preference is automatically saved and will persist
              across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
