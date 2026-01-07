/**
 * Gallery Theme System
 *
 * Provides consistent theming for public gallery pages.
 * Maps to the design system tokens in globals.css while supporting
 * dynamic theme switching (light/dark/auto).
 *
 * Usage:
 * - getGalleryThemeColors(theme) - Get theme color object
 * - getGalleryThemeStyles(theme) - Get inline style object
 * - useGalleryTheme(theme) - React hook for auto theme detection
 */

export type GalleryTheme = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

/**
 * Theme color definitions that map to design system tokens.
 * These values match the CSS custom properties in globals.css
 */
export interface GalleryThemeColors {
  // Backgrounds
  bgColor: string;
  cardBg: string;
  surfaceBg: string;
  elevatedBg: string;
  hoverBg: string;

  // Text
  textColor: string;
  textSecondary: string;
  mutedColor: string;

  // Borders
  borderColor: string;
  borderHover: string;
  borderVisible: string;

  // Overlays
  overlay: string;
  overlayHeavy: string;
}

export const GALLERY_THEME_COLORS: Record<ResolvedTheme, GalleryThemeColors> = {
  dark: {
    // Backgrounds
    bgColor: "#0a0a0a", // --background
    cardBg: "#141414", // --card
    surfaceBg: "#191919", // --background-tertiary
    elevatedBg: "#1e1e1e", // --background-elevated
    hoverBg: "#2a2a2a", // --background-hover

    // Text
    textColor: "#ffffff", // --foreground
    textSecondary: "#a3a3a3", // --foreground-secondary
    mutedColor: "#8b8b8b", // --foreground-muted

    // Borders
    borderColor: "rgba(255, 255, 255, 0.10)", // --border
    borderHover: "rgba(255, 255, 255, 0.16)", // --border-hover
    borderVisible: "#333333", // --border-visible

    // Overlays
    overlay: "rgba(0, 0, 0, 0.6)", // --overlay
    overlayHeavy: "rgba(0, 0, 0, 0.8)", // --overlay-heavy
  },
  light: {
    // Backgrounds
    bgColor: "#ffffff",
    cardBg: "#f3f4f6",
    surfaceBg: "#f9fafb",
    elevatedBg: "#ffffff",
    hoverBg: "#e5e7eb",

    // Text
    textColor: "#0a0a0a",
    textSecondary: "#4b5563",
    mutedColor: "#6b7280",

    // Borders
    borderColor: "rgba(0, 0, 0, 0.10)",
    borderHover: "rgba(0, 0, 0, 0.16)",
    borderVisible: "#d1d5db",

    // Overlays
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayHeavy: "rgba(0, 0, 0, 0.7)",
  },
};

/**
 * CSS custom property names for gallery themes.
 * These can be set as CSS variables on a container to theme child elements.
 */
export const GALLERY_CSS_VARS = {
  bgColor: "--gallery-bg",
  cardBg: "--gallery-card-bg",
  surfaceBg: "--gallery-surface-bg",
  elevatedBg: "--gallery-elevated-bg",
  hoverBg: "--gallery-hover-bg",
  textColor: "--gallery-text",
  textSecondary: "--gallery-text-secondary",
  mutedColor: "--gallery-text-muted",
  borderColor: "--gallery-border",
  borderHover: "--gallery-border-hover",
  borderVisible: "--gallery-border-visible",
  overlay: "--gallery-overlay",
  overlayHeavy: "--gallery-overlay-heavy",
} as const;

/**
 * Get theme colors for a given theme.
 * For "auto", defaults to dark - use the hook for client-side auto detection.
 */
export function getGalleryThemeColors(
  theme: GalleryTheme | ResolvedTheme
): GalleryThemeColors {
  if (theme === "auto") {
    return GALLERY_THEME_COLORS.dark;
  }
  return GALLERY_THEME_COLORS[theme];
}

/**
 * Generate inline style object for gallery theming.
 * Useful for applying theme colors directly to elements.
 */
export function getGalleryThemeStyles(
  theme: GalleryTheme | ResolvedTheme
): React.CSSProperties {
  const colors = getGalleryThemeColors(theme);
  return {
    backgroundColor: colors.bgColor,
    color: colors.textColor,
  };
}

/**
 * Generate CSS custom properties for gallery theme.
 * Apply these to a container to make theme colors available to children.
 */
export function getGalleryThemeCSSVars(
  theme: GalleryTheme | ResolvedTheme
): Record<string, string> {
  const colors = getGalleryThemeColors(theme);
  return {
    [GALLERY_CSS_VARS.bgColor]: colors.bgColor,
    [GALLERY_CSS_VARS.cardBg]: colors.cardBg,
    [GALLERY_CSS_VARS.surfaceBg]: colors.surfaceBg,
    [GALLERY_CSS_VARS.elevatedBg]: colors.elevatedBg,
    [GALLERY_CSS_VARS.hoverBg]: colors.hoverBg,
    [GALLERY_CSS_VARS.textColor]: colors.textColor,
    [GALLERY_CSS_VARS.textSecondary]: colors.textSecondary,
    [GALLERY_CSS_VARS.mutedColor]: colors.mutedColor,
    [GALLERY_CSS_VARS.borderColor]: colors.borderColor,
    [GALLERY_CSS_VARS.borderHover]: colors.borderHover,
    [GALLERY_CSS_VARS.borderVisible]: colors.borderVisible,
    [GALLERY_CSS_VARS.overlay]: colors.overlay,
    [GALLERY_CSS_VARS.overlayHeavy]: colors.overlayHeavy,
  };
}

/**
 * Get the appropriate logo URL based on theme.
 */
export function getThemedLogoUrl(
  theme: ResolvedTheme,
  logoUrl: string | null,
  logoLightUrl: string | null
): string | null {
  if (theme === "light" && logoLightUrl) {
    return logoLightUrl;
  }
  return logoUrl;
}

/**
 * Create a color with opacity for banners/alerts.
 * Used for creating themed backgrounds with transparency.
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Handle rgba colors - replace the alpha
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  // Handle rgb colors - add alpha
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
  }
  return color;
}

/**
 * Common status colors used across gallery pages.
 * These are consistent regardless of light/dark theme.
 */
export const GALLERY_STATUS_COLORS = {
  success: "#22c55e", // --success
  error: "#ef4444", // --error
  warning: "#f97316", // --warning
  info: "#3b82f6", // --primary

  // With opacity variants for backgrounds
  successBg: "rgba(34, 197, 94, 0.15)",
  errorBg: "rgba(239, 68, 68, 0.15)",
  warningBg: "rgba(249, 115, 22, 0.15)",
  infoBg: "rgba(59, 130, 246, 0.15)",
} as const;
