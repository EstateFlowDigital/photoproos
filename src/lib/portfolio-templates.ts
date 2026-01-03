import type { PortfolioTemplate, PortfolioType, PortfolioSectionType } from "@prisma/client";

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

export interface TemplateColors {
  primary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSecondary: string;
}

export interface TemplateConfig {
  name: string;
  description: string;
  colors: TemplateColors;
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  defaultSections: PortfolioSectionType[];
  isDark: boolean;
}

export const PORTFOLIO_TEMPLATES: Record<PortfolioTemplate, TemplateConfig> = {
  modern: {
    name: "Modern",
    description: "Clean, minimal design with focus on imagery",
    colors: {
      primary: "#3b82f6",
      accent: "#8b5cf6",
      background: "#0a0a0a",
      backgroundSecondary: "#141414",
      card: "#141414",
      cardBorder: "rgba(255, 255, 255, 0.08)",
      text: "#ffffff",
      textMuted: "#a7a7a7",
      textSecondary: "#7c7c7c",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: "12px",
    defaultSections: ["hero", "gallery", "about", "contact"],
    isDark: true,
  },
  bold: {
    name: "Bold",
    description: "High contrast, dramatic presentation",
    colors: {
      primary: "#ef4444",
      accent: "#f97316",
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      card: "#18181b",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      textSecondary: "#71717a",
    },
    fonts: {
      heading: "Oswald",
      body: "Inter",
    },
    borderRadius: "0px",
    defaultSections: ["hero", "gallery", "testimonials", "contact"],
    isDark: true,
  },
  elegant: {
    name: "Elegant",
    description: "Luxury feel with refined typography",
    colors: {
      primary: "#d4af37",
      accent: "#b8860b",
      background: "#0f0f0f",
      backgroundSecondary: "#1a1a1a",
      card: "#1a1a1a",
      cardBorder: "rgba(212, 175, 55, 0.15)",
      text: "#f5f5f5",
      textMuted: "#9ca3af",
      textSecondary: "#6b7280",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
    },
    borderRadius: "4px",
    defaultSections: ["hero", "about", "gallery", "awards", "contact"],
    isDark: true,
  },
  minimal: {
    name: "Minimal",
    description: "Clean whitespace for elegant presentation",
    colors: {
      primary: "#111111",
      accent: "#333333",
      background: "#ffffff",
      backgroundSecondary: "#f9fafb",
      card: "#ffffff",
      cardBorder: "#e5e7eb",
      text: "#111111",
      textMuted: "#6b7280",
      textSecondary: "#9ca3af",
    },
    fonts: {
      heading: "DM Sans",
      body: "DM Sans",
    },
    borderRadius: "8px",
    defaultSections: ["hero", "gallery", "services", "contact"],
    isDark: false,
  },
  creative: {
    name: "Creative",
    description: "Asymmetric layouts for artistic expression",
    colors: {
      primary: "#8b5cf6",
      accent: "#ec4899",
      background: "#0c0a09",
      backgroundSecondary: "#1c1917",
      card: "#1c1917",
      cardBorder: "rgba(139, 92, 246, 0.2)",
      text: "#fafaf9",
      textMuted: "#a8a29e",
      textSecondary: "#78716c",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
    },
    borderRadius: "16px",
    defaultSections: ["hero", "gallery", "about", "testimonials", "contact"],
    isDark: true,
  },
};

// ============================================================================
// PORTFOLIO TYPE DEFAULTS
// ============================================================================

export interface PortfolioTypeConfig {
  name: string;
  description: string;
  icon: string;
  defaultSections: PortfolioSectionType[];
  defaultHeroConfig: {
    ctaText: string;
    ctaLink?: string;
    alignment: "left" | "center" | "right";
  };
}

export const PORTFOLIO_TYPE_DEFAULTS: Record<PortfolioType, PortfolioTypeConfig> = {
  photographer: {
    name: "Showcase Portfolio",
    description: "Market your work and attract new clients",
    icon: "Camera",
    defaultSections: ["hero", "about", "gallery", "services", "testimonials", "contact"],
    defaultHeroConfig: {
      ctaText: "Book a Session",
      alignment: "center",
    },
  },
  client: {
    name: "Client Gallery",
    description: "Deliver projects and share work with clients",
    icon: "FolderOpen",
    defaultSections: ["hero", "gallery", "contact"],
    defaultHeroConfig: {
      ctaText: "Download Photos",
      alignment: "center",
    },
  },
};

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export interface SectionDefinition {
  type: PortfolioSectionType;
  name: string;
  description: string;
  icon: string;
  category: "preset" | "freeform";
  defaultConfig: Record<string, unknown>;
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  // Preset Sections
  {
    type: "hero",
    name: "Hero",
    description: "Full-width hero with title, subtitle, and call-to-action",
    icon: "Sparkles",
    category: "preset",
    defaultConfig: {
      title: "",
      subtitle: "",
      backgroundImageUrl: null,
      backgroundVideoUrl: null,
      ctaText: "Get in Touch",
      ctaLink: "#contact",
      overlay: "dark",
      alignment: "center",
    },
  },
  {
    type: "about",
    name: "About",
    description: "Bio section with photo and highlights",
    icon: "User",
    category: "preset",
    defaultConfig: {
      photoUrl: null,
      title: "About Me",
      content: "",
      highlights: [],
    },
  },
  {
    type: "gallery",
    name: "Gallery",
    description: "Showcase your projects in a grid layout",
    icon: "Images",
    category: "preset",
    defaultConfig: {
      projectIds: [],
      layout: "grid",
      columns: 3,
      showProjectNames: true,
    },
  },
  {
    type: "services",
    name: "Services",
    description: "List your photography services and packages",
    icon: "Package",
    category: "preset",
    defaultConfig: {
      title: "Services",
      items: [],
      showPricing: false,
    },
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Client reviews and recommendations",
    icon: "Quote",
    category: "preset",
    defaultConfig: {
      title: "What Clients Say",
      items: [],
      layout: "cards",
    },
  },
  {
    type: "awards",
    name: "Awards & Press",
    description: "Showcase achievements, publications, and recognition",
    icon: "Trophy",
    category: "preset",
    defaultConfig: {
      title: "Awards & Recognition",
      items: [],
    },
  },
  {
    type: "contact",
    name: "Contact",
    description: "Contact information and inquiry form",
    icon: "Mail",
    category: "preset",
    defaultConfig: {
      title: "Get in Touch",
      showForm: true,
      showMap: false,
      showSocial: true,
      customFields: [],
    },
  },
  {
    type: "faq",
    name: "FAQ",
    description: "Frequently asked questions with expandable answers",
    icon: "HelpCircle",
    category: "preset",
    defaultConfig: {
      title: "Frequently Asked Questions",
      items: [],
    },
  },
  // Freeform Blocks
  {
    type: "text",
    name: "Text Block",
    description: "Rich text content block",
    icon: "Type",
    category: "freeform",
    defaultConfig: {
      content: "",
      alignment: "left",
    },
  },
  {
    type: "image",
    name: "Image",
    description: "Single image or image gallery",
    icon: "Image",
    category: "freeform",
    defaultConfig: {
      url: null,
      alt: "",
      caption: "",
      layout: "contained",
    },
  },
  {
    type: "video",
    name: "Video Embed",
    description: "YouTube or Vimeo video embed",
    icon: "Play",
    category: "freeform",
    defaultConfig: {
      url: "",
      autoplay: false,
      loop: false,
      muted: true,
    },
  },
  {
    type: "spacer",
    name: "Spacer",
    description: "Add vertical space between sections",
    icon: "Minus",
    category: "freeform",
    defaultConfig: {
      height: 80,
    },
  },
  {
    type: "custom_html",
    name: "Custom HTML",
    description: "Add custom HTML code (advanced)",
    icon: "Code",
    category: "freeform",
    defaultConfig: {
      html: "",
    },
  },
];

// ============================================================================
// SOCIAL PLATFORMS
// ============================================================================

export const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "Instagram", urlPrefix: "https://instagram.com/" },
  { id: "facebook", name: "Facebook", icon: "Facebook", urlPrefix: "https://facebook.com/" },
  { id: "twitter", name: "X (Twitter)", icon: "Twitter", urlPrefix: "https://x.com/" },
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin", urlPrefix: "https://linkedin.com/in/" },
  { id: "youtube", name: "YouTube", icon: "Youtube", urlPrefix: "https://youtube.com/@" },
  { id: "tiktok", name: "TikTok", icon: "Music2", urlPrefix: "https://tiktok.com/@" },
  { id: "pinterest", name: "Pinterest", icon: "Pin", urlPrefix: "https://pinterest.com/" },
  { id: "behance", name: "Behance", icon: "Pen", urlPrefix: "https://behance.net/" },
  { id: "dribbble", name: "Dribbble", icon: "Dribbble", urlPrefix: "https://dribbble.com/" },
  { id: "website", name: "Website", icon: "Globe", urlPrefix: "" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["id"];

// ============================================================================
// GOOGLE FONTS
// ============================================================================

export const GOOGLE_FONTS = [
  { name: "Inter", category: "sans-serif" },
  { name: "DM Sans", category: "sans-serif" },
  { name: "Oswald", category: "sans-serif" },
  { name: "Space Grotesk", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "Source Serif Pro", category: "serif" },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTemplateConfig(template: PortfolioTemplate): TemplateConfig {
  return PORTFOLIO_TEMPLATES[template];
}

export function getDefaultSectionsForType(
  portfolioType: PortfolioType,
  template: PortfolioTemplate
): PortfolioSectionType[] {
  // Use template defaults if available, otherwise fall back to type defaults
  const templateConfig = PORTFOLIO_TEMPLATES[template];
  const typeConfig = PORTFOLIO_TYPE_DEFAULTS[portfolioType];

  // Merge: start with type defaults, but respect template suggestions
  return typeConfig.defaultSections;
}

export function getSectionDefinition(type: PortfolioSectionType): SectionDefinition | undefined {
  return SECTION_DEFINITIONS.find((s) => s.type === type);
}

export function getPresetSections(): SectionDefinition[] {
  return SECTION_DEFINITIONS.filter((s) => s.category === "preset");
}

export function getFreeformBlocks(): SectionDefinition[] {
  return SECTION_DEFINITIONS.filter((s) => s.category === "freeform");
}

export function generateCSSVariables(
  template: PortfolioTemplate,
  primaryOverride?: string | null,
  accentOverride?: string | null
): Record<string, string> {
  const config = PORTFOLIO_TEMPLATES[template];

  return {
    "--portfolio-primary": primaryOverride || config.colors.primary,
    "--portfolio-accent": accentOverride || config.colors.accent,
    "--portfolio-bg": config.colors.background,
    "--portfolio-bg-secondary": config.colors.backgroundSecondary,
    "--portfolio-card": config.colors.card,
    "--portfolio-card-border": config.colors.cardBorder,
    "--portfolio-text": config.colors.text,
    "--portfolio-text-muted": config.colors.textMuted,
    "--portfolio-text-secondary": config.colors.textSecondary,
    "--portfolio-radius": config.borderRadius,
    "--portfolio-font-heading": config.fonts.heading,
    "--portfolio-font-body": config.fonts.body,
  };
}

export function getGoogleFontsUrl(fontHeading?: string | null, fontBody?: string | null): string {
  const template = PORTFOLIO_TEMPLATES.modern; // Default fallback
  const fonts = new Set<string>();

  fonts.add(fontHeading || template.fonts.heading);
  fonts.add(fontBody || template.fonts.body);

  const fontFamilies = Array.from(fonts)
    .map((font) => font.replace(/ /g, "+") + ":wght@400;500;600;700")
    .join("&family=");

  return `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
}
