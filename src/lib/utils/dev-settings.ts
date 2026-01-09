/**
 * Developer Settings Utility
 * Manages localStorage-based settings for developer debugging tools
 */

const STORAGE_KEY = "ppos_dev_settings";

export interface DevSettings {
  /** Hide the Bug Probe panel (bottom-right debugger) */
  hideBugProbe: boolean;
  /** Hide the HUD overlay (top-left navigation debugger) */
  hideHUD: boolean;
  /** Hide the Debug Banner (error capture panel) */
  hideDebugBanner: boolean;
  /** Enable verbose navigation debugging in console */
  enableNavDebug: boolean;
}

const DEFAULT_SETTINGS: DevSettings = {
  hideBugProbe: false,
  hideHUD: false,
  hideDebugBanner: false,
  enableNavDebug: false,
};

/**
 * Get current dev settings from localStorage
 */
export function getDevSettings(): DevSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<DevSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update dev settings in localStorage
 */
export function updateDevSettings(updates: Partial<DevSettings>): DevSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const current = getDevSettings();
  const updated = { ...current, ...updates };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also sync the legacy nav debug setting for backward compatibility
    if (updates.enableNavDebug !== undefined) {
      if (updates.enableNavDebug) {
        localStorage.setItem("ppos_nav_debug", "true");
      } else {
        localStorage.removeItem("ppos_nav_debug");
      }
    }

    // Dispatch custom event for same-tab component updates
    // (storage event only fires for other tabs/windows)
    window.dispatchEvent(new CustomEvent("ppos_dev_settings_changed"));
  } catch {
    // Ignore storage errors
  }

  return updated;
}

/**
 * Reset dev settings to defaults
 */
export function resetDevSettings(): DevSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ppos_nav_debug");
  } catch {
    // Ignore storage errors
  }

  return DEFAULT_SETTINGS;
}

/**
 * Check if a specific dev tool should be hidden
 */
export function isDevToolHidden(tool: keyof Pick<DevSettings, "hideBugProbe" | "hideHUD" | "hideDebugBanner">): boolean {
  return getDevSettings()[tool];
}
