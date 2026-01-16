/**
 * Analytics Utility Functions
 *
 * Client-safe utility functions for analytics.
 * These are separated from the main analytics.ts server actions file
 * because "use server" files require all exports to be async functions.
 */

/**
 * Parse user agent to extract device, browser, and OS info
 */
export function parseUserAgent(userAgent: string): {
  deviceType: string;
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();

  // Device type
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = /tablet|ipad/i.test(ua) ? "tablet" : "mobile";
  }

  // Browser
  let browser = "other";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "safari";
  } else if (ua.includes("firefox")) {
    browser = "firefox";
  } else if (ua.includes("edg")) {
    browser = "edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "opera";
  }

  // OS
  let os = "other";
  if (ua.includes("windows")) {
    os = "windows";
  } else if (ua.includes("mac os")) {
    os = "macos";
  } else if (ua.includes("linux")) {
    os = "linux";
  } else if (ua.includes("android")) {
    os = "android";
  } else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
    os = "ios";
  }

  return { deviceType, browser, os };
}

/**
 * Parse referrer to get source category
 */
export function parseReferrer(referrer: string | null): string {
  if (!referrer) return "direct";

  const url = referrer.toLowerCase();

  if (url.includes("google.")) return "google";
  if (url.includes("bing.")) return "bing";
  if (url.includes("yahoo.")) return "yahoo";
  if (url.includes("duckduckgo.")) return "duckduckgo";

  if (
    url.includes("facebook.") ||
    url.includes("twitter.") ||
    url.includes("linkedin.") ||
    url.includes("instagram.") ||
    url.includes("t.co")
  ) {
    return "social";
  }

  return "referral";
}

/**
 * Generate a unique visitor ID
 */
export function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
