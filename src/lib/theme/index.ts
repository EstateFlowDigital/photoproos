// Gallery Theme System
// Centralized theming for public gallery pages

export {
  // Types
  type GalleryTheme,
  type ResolvedTheme,
  type GalleryThemeColors,
  // Constants
  GALLERY_THEME_COLORS,
  GALLERY_CSS_VARS,
  GALLERY_STATUS_COLORS,
  // Utilities
  getGalleryThemeColors,
  getGalleryThemeStyles,
  getGalleryThemeCSSVars,
  getThemedLogoUrl,
  withOpacity,
} from "./gallery-theme";

export { useGalleryTheme, useResolvedTheme } from "./use-gallery-theme";
