/**
 * Type-safe localStorage utilities
 * Provides SSR-safe wrappers with JSON serialization and type safety
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * Centralized storage keys to prevent typos and ensure consistency
 */
export const STORAGE_KEYS = {
  // Navigation preferences
  NAV_ORDER: "ppos_nav_order",
  NAV_HIDDEN: "ppos_nav_hidden",
  NAV_PINNED: "ppos_nav_pinned",
  NAV_EDIT_MODE: "ppos_nav_edit_mode",
  NAV_DEBUG: "ppos_nav_debug",
  SIDEBAR_COLLAPSED: "ppos_sidebar_collapsed",
  RECENT_SEARCH: "ppos_recent_search",

  // User preferences
  THEME: "photoproos-theme",
  DEV_TOOLS: "photoproos-dev-tools",

  // Session/state
  ONBOARDING_DISMISSED: "ppos_onboarding_dismissed",
  SOCIAL_PROOF_DISMISSED: "socialProofDismissed",
  EXIT_INTENT_LAST_SHOWN: "exitIntentLastShown",
  PORTFOLIO_VISITOR_ID: "portfolio-visitor-id",
  REFERRAL_CODE: "platformReferralCode",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ============================================================================
// CORE UTILITIES
// ============================================================================

/**
 * Check if we're running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get an item from localStorage with JSON parsing
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Get a raw string from localStorage (no JSON parsing)
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 */
export function getStorageString(key: string, defaultValue: string | null = null): string | null {
  if (!isBrowser()) return defaultValue;
  return window.localStorage.getItem(key) ?? defaultValue;
}

/**
 * Set an item in localStorage with JSON serialization
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

/**
 * Set a raw string in localStorage (no JSON serialization)
 * @param key - Storage key
 * @param value - String value to store
 */
export function setStorageString(key: string, value: string): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

/**
 * Remove an item from localStorage
 * @param key - Storage key to remove
 */
export function removeStorageItem(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

/**
 * Get a boolean value from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 */
export function getStorageBoolean(key: string, defaultValue: boolean = false): boolean {
  if (!isBrowser()) return defaultValue;
  const value = window.localStorage.getItem(key);
  if (value === null) return defaultValue;
  return value === "true" || value === "1" || value === "enabled";
}

/**
 * Set a boolean value in localStorage
 * @param key - Storage key
 * @param value - Boolean value to store
 */
export function setStorageBoolean(key: string, value: boolean): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, value ? "true" : "false");
}

// ============================================================================
// SPECIALIZED HELPERS
// ============================================================================

/**
 * Get an array from localStorage
 * @param key - Storage key
 */
export function getStorageArray<T>(key: string): T[] {
  return getStorageItem<T[]>(key, []);
}

/**
 * Append to an array in localStorage (with max size limit)
 * @param key - Storage key
 * @param item - Item to prepend
 * @param maxSize - Maximum array size (default 10)
 * @param unique - If true, removes duplicate items
 */
export function prependToStorageArray<T>(
  key: string,
  item: T,
  maxSize: number = 10,
  unique: boolean = true
): T[] {
  if (!isBrowser()) return [item];

  let array = getStorageArray<T>(key);

  if (unique) {
    array = array.filter((existing) => JSON.stringify(existing) !== JSON.stringify(item));
  }

  const next = [item, ...array].slice(0, maxSize);
  setStorageItem(key, next);
  return next;
}

/**
 * Check if a timestamp in localStorage is within a time window
 * Useful for rate-limiting or "don't show again for X hours" features
 * @param key - Storage key containing the timestamp
 * @param windowMs - Time window in milliseconds
 */
export function isWithinTimeWindow(key: string, windowMs: number): boolean {
  if (!isBrowser()) return false;

  const stored = window.localStorage.getItem(key);
  if (!stored) return false;

  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return false;

  return Date.now() - timestamp < windowMs;
}

/**
 * Set current timestamp in localStorage
 * @param key - Storage key
 */
export function setTimestamp(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, Date.now().toString());
}

/**
 * Generate or retrieve a persistent visitor ID
 * Useful for anonymous analytics
 * @param key - Storage key for the visitor ID
 */
export function getOrCreateVisitorId(key: string = STORAGE_KEYS.PORTFOLIO_VISITOR_ID): string {
  if (!isBrowser()) return "";

  let visitorId = window.localStorage.getItem(key);
  if (!visitorId) {
    visitorId = `visitor_${crypto.randomUUID()}`;
    window.localStorage.setItem(key, visitorId);
  }
  return visitorId;
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clear multiple storage keys at once
 * @param keys - Array of storage keys to remove
 */
export function clearStorageKeys(keys: string[]): void {
  if (!isBrowser()) return;
  keys.forEach((key) => window.localStorage.removeItem(key));
}

/**
 * Clear all app-specific storage (keys starting with "ppos_" or "photoproos-")
 */
export function clearAppStorage(): void {
  if (!isBrowser()) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (key.startsWith("ppos_") || key.startsWith("photoproos-"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}
