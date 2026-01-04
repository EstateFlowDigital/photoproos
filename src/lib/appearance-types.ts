export interface AppearancePreferences {
  dashboardTheme: string;
  dashboardAccent: string;
  sidebarCompact: boolean;
}

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
