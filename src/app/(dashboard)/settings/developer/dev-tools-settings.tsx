"use client";

import { useEffect, useState } from "react";
import {
  getDevSettings,
  updateDevSettings,
  resetDevSettings,
  type DevSettings,
} from "@/lib/utils/dev-settings";

export function DevToolsSettings() {
  const [settings, setSettings] = useState<DevSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getDevSettings());
  }, []);

  const handleToggle = (key: keyof DevSettings) => {
    if (!settings) return;
    const updated = updateDevSettings({ [key]: !settings[key] });
    setSettings(updated);
  };

  const handleReset = () => {
    const defaults = resetDevSettings();
    setSettings(defaults);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !settings) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Debug Tools</h2>
            <p className="text-sm text-foreground-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Debug Tools</h2>
            <p className="text-sm text-foreground-muted">Control visibility of developer debugging overlays</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      <div className="space-y-4">
        {/* Bug Probe Toggle */}
        <ToggleRow
          label="Bug Probe Panel"
          description="Bottom-right debugging panel with click tracking, error capture, screenshots, and voice notes"
          checked={!settings.hideBugProbe}
          onChange={() => handleToggle("hideBugProbe")}
        />

        {/* HUD Toggle */}
        <ToggleRow
          label="Navigation HUD"
          description="Top-left overlay showing navigation state, click targets, and route debugging"
          checked={!settings.hideHUD}
          onChange={() => handleToggle("hideHUD")}
        />

        {/* Debug Banner Toggle */}
        <ToggleRow
          label="Debug Banner"
          description="Bottom-right error capture panel (Cmd/Ctrl+Shift+D to toggle)"
          checked={!settings.hideDebugBanner}
          onChange={() => handleToggle("hideDebugBanner")}
        />

        {/* Nav Debug Console Toggle */}
        <ToggleRow
          label="Console Navigation Logging"
          description="Log detailed navigation events to browser console for debugging"
          checked={settings.enableNavDebug}
          onChange={() => handleToggle("enableNavDebug")}
        />

        {/* Element Inspector Toggle */}
        <ToggleRow
          label="Element Inspector"
          description="Click any element to inspect styles and copy info for Claude Code"
          checked={!settings.hideElementInspector}
          onChange={() => handleToggle("hideElementInspector")}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
        <p className="text-xs text-foreground-muted">
          Changes take effect immediately. Refresh the page if tools don&apos;t update.
        </p>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-foreground-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.295a1 1 0 0 1 .804.98v1.36a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.295 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.295A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.295-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
    </svg>
  );
}
