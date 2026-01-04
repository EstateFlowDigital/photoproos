"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  updateAppearancePreferences,
  applyThemePreset,
  resetAppearancePreferences,
} from "@/lib/actions/appearance";
import { DEFAULT_APPEARANCE } from "@/lib/appearance-types";
import type { AppearancePreferences, ThemePreset, FontOption, DensityOption } from "@/lib/appearance-types";
import { useToast } from "@/components/ui/toast";

interface AppearanceSettingsFormProps {
  initialPreferences: AppearancePreferences;
  themePresets: ThemePreset[];
  fontOptions: FontOption[];
  densityOptions: DensityOption[];
}

interface PreviewState {
  accentColor: string | null;
  fontFamily: string | null;
  density: string | null;
}

export function AppearanceSettingsForm({
  initialPreferences,
  themePresets,
  fontOptions,
  densityOptions,
}: AppearanceSettingsFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [customColor, setCustomColor] = useState(
    initialPreferences.dashboardTheme === "custom"
      ? initialPreferences.dashboardAccent
      : "#3b82f6"
  );

  // Preview state - separate from saved preferences
  const [preview, setPreview] = useState<PreviewState>({
    accentColor: null,
    fontFamily: null,
    density: null,
  });

  const hasPreviewChanges = preview.accentColor !== null || preview.fontFamily !== null || preview.density !== null;

  // Apply preview styles dynamically
  useEffect(() => {
    const styleId = "appearance-preview-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const accentColor = preview.accentColor || preferences.dashboardAccent;
    const fontOption = fontOptions.find((f) => f.id === (preview.fontFamily || preferences.fontFamily));
    const densityOption = densityOptions.find((d) => d.id === (preview.density || preferences.density));
    const fontFamily = fontOption?.fontFamily || fontOptions[0].fontFamily;
    const densityScale = densityOption?.scale || 1;

    styleEl.textContent = `
      :root, [data-theme="dark"], [data-theme="light"] {
        --primary: ${accentColor} !important;
        --primary-hover: ${accentColor}e6 !important;
        --font-family: ${fontFamily} !important;
        --density-scale: ${densityScale} !important;
        --card-padding: calc(24px * ${densityScale}) !important;
        --section-gap: calc(24px * ${densityScale}) !important;
        --item-gap: calc(16px * ${densityScale}) !important;
      }
      body {
        font-family: var(--font-family) !important;
      }
    `;

    return () => {
      // Clean up on unmount
    };
  }, [preview, preferences, fontOptions, densityOptions]);

  // Reset preview on component unmount or navigation
  useEffect(() => {
    return () => {
      const styleEl = document.getElementById("appearance-preview-styles");
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  const resetPreview = useCallback(() => {
    setPreview({ accentColor: null, fontFamily: null, density: null });
    showToast("Preview reset", "info");
  }, [showToast]);

  const handleThemePreview = (presetId: string) => {
    const preset = themePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setPreview((prev) => ({ ...prev, accentColor: preset.accent }));
  };

  const handleThemeSave = (presetId: string) => {
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
        setPreview((prev) => ({ ...prev, accentColor: null }));
        showToast(`Theme saved: ${preset.name}`, "success");
      } else {
        showToast(result.error || "Failed to save theme", "error");
      }
    });
  };

  const handleCustomColorPreview = (color: string) => {
    setCustomColor(color);
    setPreview((prev) => ({ ...prev, accentColor: color }));
  };

  const handleCustomColorSave = () => {
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
        setPreview((prev) => ({ ...prev, accentColor: null }));
        showToast("Custom color saved", "success");
      } else {
        showToast(result.error || "Failed to save custom color", "error");
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

  const handleFontPreview = (fontId: string) => {
    setPreview((prev) => ({ ...prev, fontFamily: fontId }));
  };

  const handleFontSave = (fontId: string) => {
    const font = fontOptions.find((f) => f.id === fontId);
    if (!font) return;

    startTransition(async () => {
      const result = await updateAppearancePreferences({
        fontFamily: fontId,
      });
      if (result.success) {
        setPreferences({ ...preferences, fontFamily: fontId });
        setPreview((prev) => ({ ...prev, fontFamily: null }));
        showToast(`Font saved: ${font.name}`, "success");
      } else {
        showToast(result.error || "Failed to save font", "error");
      }
    });
  };

  const handleDensityPreview = (densityId: string) => {
    setPreview((prev) => ({ ...prev, density: densityId }));
  };

  const handleDensitySave = (densityId: string) => {
    const density = densityOptions.find((d) => d.id === densityId);
    if (!density) return;

    startTransition(async () => {
      const result = await updateAppearancePreferences({
        density: densityId,
      });
      if (result.success) {
        setPreferences({ ...preferences, density: densityId });
        setPreview((prev) => ({ ...prev, density: null }));
        showToast(`Density saved: ${density.name}`, "success");
      } else {
        showToast(result.error || "Failed to save density", "error");
      }
    });
  };

  const handleResetToDefaults = () => {
    startTransition(async () => {
      const result = await resetAppearancePreferences();
      if (result.success) {
        setPreferences(DEFAULT_APPEARANCE);
        setCustomColor("#3b82f6");
        setPreview({ accentColor: null, fontFamily: null, density: null });
        showToast("Settings reset to defaults", "success");
        window.location.reload();
      } else {
        showToast(result.error || "Failed to reset settings", "error");
      }
    });
  };

  // Get current preview values
  const currentAccentColor = preview.accentColor || preferences.dashboardAccent;
  const currentFontId = preview.fontFamily || preferences.fontFamily;
  const currentDensityId = preview.density || preferences.density;

  return (
    <div className="space-y-8">
      {/* Preview Banner */}
      {hasPreviewChanges && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-4">
          <div className="flex items-center gap-3">
            <EyeIcon className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Preview Mode
              </p>
              <p className="text-xs text-foreground-muted">
                You&apos;re viewing unsaved changes. Click save on any section to keep changes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetPreview}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            Reset Preview
          </button>
        </div>
      )}

      {/* Theme Presets */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Color Themes
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Click to preview, then click &quot;Save&quot; to apply permanently.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themePresets
            .filter((preset) => preset.id !== "custom")
            .map((preset) => {
              const isSaved = preferences.dashboardTheme === preset.id;
              const isPreviewing = preview.accentColor === preset.accent;
              return (
                <div
                  key={preset.id}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                    isPreviewing
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20"
                      : isSaved
                        ? "border-[var(--success)] bg-[var(--success)]/5"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg"
                  )}
                >
                  {/* Color Preview */}
                  <button
                    type="button"
                    onClick={() => handleThemePreview(preset.id)}
                    disabled={isPending}
                    className="flex items-center gap-3 mb-3"
                  >
                    <div
                      className="h-10 w-10 rounded-lg shadow-inner"
                      style={{ backgroundColor: preset.accent }}
                    />
                    <div
                      className="h-10 w-10 rounded-lg opacity-60"
                      style={{ backgroundColor: preset.preview.secondary }}
                    />
                  </button>

                  {/* Name and Description */}
                  <h3 className="font-medium text-foreground">{preset.name}</h3>
                  <p className="text-xs text-foreground-muted mt-1">
                    {preset.description}
                  </p>

                  {/* Status Indicator */}
                  {isSaved && !isPreviewing && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium text-[var(--success)]">Saved</span>
                    </div>
                  )}
                  {isPreviewing && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium text-[var(--primary)]">Previewing</span>
                    </div>
                  )}

                  {/* Save Button */}
                  {isPreviewing && !isSaved && (
                    <button
                      type="button"
                      onClick={() => handleThemeSave(preset.id)}
                      disabled={isPending}
                      className="mt-3 w-full rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
                    >
                      {isPending ? "Saving..." : "Save Theme"}
                    </button>
                  )}
                </div>
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
          Pick any color to use as your dashboard accent. Changes preview live.
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
                  onChange={(e) => handleCustomColorPreview(e.target.value)}
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
                onChange={(e) => handleCustomColorPreview(e.target.value)}
                placeholder="#3b82f6"
                className="w-28 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground uppercase"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomColorSave}
            disabled={isPending}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ backgroundColor: customColor }}
          >
            {isPending ? "Saving..." : "Save Custom Color"}
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

      {/* Font Selection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Typography
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Click to preview, then save to apply permanently.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fontOptions.map((font) => {
            const isSaved = preferences.fontFamily === font.id;
            const isPreviewing = preview.fontFamily === font.id;
            return (
              <div
                key={font.id}
                className={cn(
                  "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                  isPreviewing
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20"
                    : isSaved
                      ? "border-[var(--success)] bg-[var(--success)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg"
                )}
              >
                {/* Font Preview */}
                <button
                  type="button"
                  onClick={() => handleFontPreview(font.id)}
                  disabled={isPending}
                  className="text-2xl mb-2 text-foreground text-left"
                  style={{ fontFamily: font.fontFamily }}
                >
                  Aa
                </button>

                {/* Name and Description */}
                <h3 className="font-medium text-foreground">{font.name}</h3>
                <p className="text-xs text-foreground-muted mt-1">
                  {font.description}
                </p>

                {/* Status Indicator */}
                {isSaved && !isPreviewing && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium text-[var(--success)]">Saved</span>
                  </div>
                )}
                {isPreviewing && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium text-[var(--primary)]">Previewing</span>
                  </div>
                )}

                {/* Save Button */}
                {isPreviewing && !isSaved && (
                  <button
                    type="button"
                    onClick={() => handleFontSave(font.id)}
                    disabled={isPending}
                    className="mt-3 w-full rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save Font"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Density/Spacing */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Content Density
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Click to preview spacing changes.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {densityOptions.map((density) => {
            const isSaved = preferences.density === density.id;
            const isPreviewing = preview.density === density.id;
            return (
              <div
                key={density.id}
                className={cn(
                  "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                  isPreviewing
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20"
                    : isSaved
                      ? "border-[var(--success)] bg-[var(--success)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg"
                )}
              >
                {/* Density Visual */}
                <button
                  type="button"
                  onClick={() => handleDensityPreview(density.id)}
                  disabled={isPending}
                  className="mb-3 flex gap-1"
                >
                  {density.id === "compact" && (
                    <>
                      <div className="h-2 w-full rounded bg-[var(--foreground-muted)]" />
                      <div className="h-2 w-full rounded bg-[var(--foreground-muted)]" />
                      <div className="h-2 w-full rounded bg-[var(--foreground-muted)]" />
                    </>
                  )}
                  {density.id === "comfortable" && (
                    <>
                      <div className="h-3 w-full rounded bg-[var(--foreground-muted)]" />
                      <div className="h-3 w-full rounded bg-[var(--foreground-muted)]" />
                    </>
                  )}
                  {density.id === "spacious" && (
                    <div className="h-4 w-full rounded bg-[var(--foreground-muted)]" />
                  )}
                </button>

                {/* Name and Description */}
                <h3 className="font-medium text-foreground">{density.name}</h3>
                <p className="text-xs text-foreground-muted mt-1">
                  {density.description}
                </p>

                {/* Status Indicator */}
                {isSaved && !isPreviewing && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium text-[var(--success)]">Saved</span>
                  </div>
                )}
                {isPreviewing && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium text-[var(--primary)]">Previewing</span>
                  </div>
                )}

                {/* Save Button */}
                {isPreviewing && !isSaved && (
                  <button
                    type="button"
                    onClick={() => handleDensitySave(density.id)}
                    disabled={isPending}
                    className="mt-3 w-full rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save Density"}
                  </button>
                )}
              </div>
            );
          })}
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

      {/* Reset to Defaults */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Reset to Defaults
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              Restore all appearance settings to their original values
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isPending}
            className={cn(
              "rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors",
              "hover:bg-[var(--error)]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isPending ? "Resetting..." : "Reset All"}
          </button>
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
