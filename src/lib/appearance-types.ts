export interface AppearancePreferences {
  dashboardTheme: string;
  dashboardAccent: string;
  sidebarCompact: boolean;
  sidebarPosition: string;
  fontFamily: string;
  density: string;
  fontSize: string;
  highContrast: boolean;
  reduceMotion: boolean;
  autoThemeEnabled: boolean;
  autoThemeDarkStart: string;
  autoThemeDarkEnd: string;
}

export type FontFamily = "system" | "inter" | "jakarta" | "dm-sans" | "space-grotesk" | "jetbrains";
export type Density = "compact" | "comfortable" | "spacious";
export type FontSize = "small" | "medium" | "large" | "x-large";
export type SidebarPosition = "left" | "right";

export interface FontOption {
  id: FontFamily;
  name: string;
  description: string;
  fontFamily: string;
  preview: string;
}

export interface DensityOption {
  id: Density;
  name: string;
  description: string;
  scale: number;
}

export interface FontSizeOption {
  id: FontSize;
  name: string;
  description: string;
  scale: number;
}

export interface SidebarPositionOption {
  id: SidebarPosition;
  name: string;
  description: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  {
    id: "small",
    name: "Small",
    description: "Smaller text for more content",
    scale: 0.875,
  },
  {
    id: "medium",
    name: "Medium",
    description: "Standard text size (default)",
    scale: 1,
  },
  {
    id: "large",
    name: "Large",
    description: "Larger text for better readability",
    scale: 1.125,
  },
  {
    id: "x-large",
    name: "Extra Large",
    description: "Extra large for accessibility",
    scale: 1.25,
  },
];

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    name: "System",
    description: "Uses your device's default font",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    preview: "The quick brown fox",
  },
  {
    id: "inter",
    name: "Inter",
    description: "Clean and modern, great for interfaces",
    fontFamily: "'Inter', sans-serif",
    preview: "The quick brown fox",
  },
  {
    id: "jakarta",
    name: "Plus Jakarta",
    description: "Friendly and approachable",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    preview: "The quick brown fox",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    description: "Geometric and contemporary",
    fontFamily: "'DM Sans', sans-serif",
    preview: "The quick brown fox",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    description: "Distinctive and technical",
    fontFamily: "'Space Grotesk', sans-serif",
    preview: "The quick brown fox",
  },
  {
    id: "jetbrains",
    name: "JetBrains Mono",
    description: "Monospace for a developer feel",
    fontFamily: "'JetBrains Mono', monospace",
    preview: "The quick brown fox",
  },
];

export const DENSITY_OPTIONS: DensityOption[] = [
  {
    id: "compact",
    name: "Compact",
    description: "Smaller spacing, more content visible",
    scale: 0.85,
  },
  {
    id: "comfortable",
    name: "Comfortable",
    description: "Balanced spacing (default)",
    scale: 1,
  },
  {
    id: "spacious",
    name: "Spacious",
    description: "More breathing room",
    scale: 1.15,
  },
];

export const SIDEBAR_POSITION_OPTIONS: SidebarPositionOption[] = [
  {
    id: "left",
    name: "Left",
    description: "Sidebar on the left side (default)",
  },
  {
    id: "right",
    name: "Right",
    description: "Sidebar on the right side",
  },
];

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  accent: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Classic Blue",
    description: "Professional and trustworthy",
    accent: "#3b82f6",
    preview: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      background: "#0A0A0A",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Fresh and natural",
    accent: "#10b981",
    preview: {
      primary: "#10b981",
      secondary: "#34d399",
      background: "#0A0A0A",
    },
  },
  {
    id: "violet",
    name: "Violet",
    description: "Creative and unique",
    accent: "#8b5cf6",
    preview: {
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      background: "#0A0A0A",
    },
  },
  {
    id: "amber",
    name: "Amber",
    description: "Warm and inviting",
    accent: "#f59e0b",
    preview: {
      primary: "#f59e0b",
      secondary: "#fbbf24",
      background: "#0A0A0A",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant and refined",
    accent: "#f43f5e",
    preview: {
      primary: "#f43f5e",
      secondary: "#fb7185",
      background: "#0A0A0A",
    },
  },
  {
    id: "cyan",
    name: "Cyan",
    description: "Modern and sleek",
    accent: "#06b6d4",
    preview: {
      primary: "#06b6d4",
      secondary: "#22d3ee",
      background: "#0A0A0A",
    },
  },
  {
    id: "orange",
    name: "Orange",
    description: "Energetic and bold",
    accent: "#f97316",
    preview: {
      primary: "#f97316",
      secondary: "#fb923c",
      background: "#0A0A0A",
    },
  },
  {
    id: "lime",
    name: "Lime",
    description: "Fresh and lively",
    accent: "#84cc16",
    preview: {
      primary: "#84cc16",
      secondary: "#a3e635",
      background: "#0A0A0A",
    },
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    description: "Bold and creative",
    accent: "#d946ef",
    preview: {
      primary: "#d946ef",
      secondary: "#e879f9",
      background: "#0A0A0A",
    },
  },
  {
    id: "sky",
    name: "Sky",
    description: "Calm and professional",
    accent: "#0ea5e9",
    preview: {
      primary: "#0ea5e9",
      secondary: "#38bdf8",
      background: "#0A0A0A",
    },
  },
];

/**
 * Default appearance preferences
 */
export const DEFAULT_APPEARANCE: AppearancePreferences = {
  dashboardTheme: "default",
  dashboardAccent: "#3b82f6",
  sidebarCompact: false,
  sidebarPosition: "left",
  fontFamily: "system",
  density: "comfortable",
  fontSize: "medium",
  highContrast: false,
  reduceMotion: false,
  autoThemeEnabled: false,
  autoThemeDarkStart: "18:00",
  autoThemeDarkEnd: "06:00",
};
