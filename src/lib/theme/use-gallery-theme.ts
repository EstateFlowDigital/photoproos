"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type GalleryTheme,
  type ResolvedTheme,
  type GalleryThemeColors,
  getGalleryThemeColors,
  getGalleryThemeCSSVars,
  getThemedLogoUrl,
} from "./gallery-theme";

interface UseGalleryThemeOptions {
  /** The theme setting (light/dark/auto) */
  theme: GalleryTheme;
  /** Optional logo URL for dark mode */
  logoUrl?: string | null;
  /** Optional logo URL for light mode */
  logoLightUrl?: string | null;
}

interface UseGalleryThemeResult {
  /** The resolved theme (never "auto") */
  resolvedTheme: ResolvedTheme;
  /** Theme colors object */
  colors: GalleryThemeColors;
  /** CSS custom properties for the theme */
  cssVars: Record<string, string>;
  /** The appropriate logo URL for the current theme */
  logoUrl: string | null;
  /** Whether the theme is currently being resolved (for SSR hydration) */
  isResolving: boolean;
}

/**
 * React hook for gallery theming with auto theme detection.
 *
 * Handles system preference detection for "auto" theme and provides
 * resolved colors and CSS variables.
 *
 * @example
 * ```tsx
 * const { resolvedTheme, colors, cssVars } = useGalleryTheme({
 *   theme: gallery.theme,
 *   logoUrl: gallery.photographer.logoUrl,
 *   logoLightUrl: gallery.photographer.logoLightUrl,
 * });
 *
 * return (
 *   <div style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
 *     {logoUrl && <img src={logoUrl} alt="Logo" />}
 *   </div>
 * );
 * ```
 */
export function useGalleryTheme({
  theme,
  logoUrl: darkLogoUrl,
  logoLightUrl,
}: UseGalleryThemeOptions): UseGalleryThemeResult {
  // Default to dark for SSR and initial render
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    theme === "auto" ? "dark" : theme
  );
  const [isResolving, setIsResolving] = useState(theme === "auto");

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      setIsResolving(false);
      return;
    }

    // Detect system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    setIsResolving(false);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const colors = useMemo(
    () => getGalleryThemeColors(resolvedTheme),
    [resolvedTheme]
  );

  const cssVars = useMemo(
    () => getGalleryThemeCSSVars(resolvedTheme),
    [resolvedTheme]
  );

  const logoUrl = useMemo(
    () => getThemedLogoUrl(resolvedTheme, darkLogoUrl ?? null, logoLightUrl ?? null),
    [resolvedTheme, darkLogoUrl, logoLightUrl]
  );

  return {
    resolvedTheme,
    colors,
    cssVars,
    logoUrl,
    isResolving,
  };
}

/**
 * Simplified hook that just returns the resolved theme.
 * Useful when you only need the theme value, not all the colors.
 */
export function useResolvedTheme(theme: GalleryTheme): ResolvedTheme {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    theme === "auto" ? "dark" : theme
  );

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setResolvedTheme(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  return resolvedTheme;
}
