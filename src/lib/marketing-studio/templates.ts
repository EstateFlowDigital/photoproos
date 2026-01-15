/**
 * Marketing Studio Template Definitions
 *
 * Pre-designed templates for social media posts, organized by category
 */

import type { PlatformId, PostFormat } from "@/components/marketing-studio/types";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platforms: PlatformId[];
  format: PostFormat;
  thumbnail?: string;
  tags: string[];
  captionTemplate?: string;
  hashtagSuggestions?: string[];
  layout: TemplateLayout;
}

export type TemplateCategory =
  | "portfolio"
  | "testimonial"
  | "beforeAfter"
  | "announcement"
  | "behindScenes"
  | "pricing"
  | "educational"
  | "milestone";

export interface TemplateLayout {
  background: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  elements: TemplateElement[];
}

export interface TemplateElement {
  type: "image" | "text" | "mockup" | "logo" | "shape";
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: Record<string, string | number>;
  content?: string;
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; name: string; description: string; icon: string }[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase your best work",
    icon: "image",
  },
  {
    id: "testimonial",
    name: "Testimonial",
    description: "Share client reviews",
    icon: "quote",
  },
  {
    id: "beforeAfter",
    name: "Before/After",
    description: "Show your editing skills",
    icon: "split",
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Share news and updates",
    icon: "megaphone",
  },
  {
    id: "behindScenes",
    name: "Behind the Scenes",
    description: "Show your process",
    icon: "camera",
  },
  {
    id: "pricing",
    name: "Pricing & Promo",
    description: "Promote your services",
    icon: "tag",
  },
  {
    id: "educational",
    name: "Educational",
    description: "Share tips and tutorials",
    icon: "lightbulb",
  },
  {
    id: "milestone",
    name: "Milestone",
    description: "Celebrate achievements",
    icon: "trophy",
  },
];

export const TEMPLATES: Template[] = [
  // Portfolio Templates
  {
    id: "portfolio-grid",
    name: "Portfolio Grid",
    description: "Display 4 of your best shots in a clean grid layout",
    category: "portfolio",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["grid", "multi-image", "minimal"],
    captionTemplate: "New work from a recent session. Which one is your favorite? 1, 2, 3, or 4?",
    hashtagSuggestions: ["#portfolio", "#photographerlife", "#newwork"],
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 50, height: 50 } },
        { type: "image", position: { x: 50, y: 0 }, size: { width: 50, height: 50 } },
        { type: "image", position: { x: 0, y: 50 }, size: { width: 50, height: 50 } },
        { type: "image", position: { x: 50, y: 50 }, size: { width: 50, height: 50 } },
      ],
    },
  },
  {
    id: "portfolio-feature",
    name: "Feature Shot",
    description: "Highlight a single stunning image with minimal branding",
    category: "portfolio",
    platforms: ["instagram", "linkedin", "twitter"],
    format: "feed",
    tags: ["single", "feature", "minimal"],
    captionTemplate: "Sometimes one image says it all.",
    hashtagSuggestions: ["#featured", "#photooftheday", "#professionalphotography"],
    layout: {
      background: "solid",
      backgroundColor: "#ffffff",
      elements: [
        { type: "image", position: { x: 5, y: 5 }, size: { width: 90, height: 80 } },
        { type: "logo", position: { x: 5, y: 90 }, size: { width: 15, height: 5 } },
      ],
    },
  },
  {
    id: "portfolio-story",
    name: "Story Showcase",
    description: "Full-screen vertical layout for Stories",
    category: "portfolio",
    platforms: ["instagram", "facebook", "tiktok"],
    format: "story",
    tags: ["story", "vertical", "fullscreen"],
    captionTemplate: "Swipe up for more!",
    layout: {
      background: "gradient",
      gradientFrom: "#1a1a2e",
      gradientTo: "#16213e",
      gradientAngle: 180,
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
        { type: "logo", position: { x: 40, y: 92 }, size: { width: 20, height: 5 } },
      ],
    },
  },

  // Testimonial Templates
  {
    id: "testimonial-quote",
    name: "Client Quote",
    description: "Elegant quote card with client testimonial",
    category: "testimonial",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["quote", "review", "social-proof"],
    captionTemplate: "Thank you @client for the kind words! It was a pleasure working with you.",
    hashtagSuggestions: ["#clientlove", "#testimonial", "#happyclients"],
    layout: {
      background: "gradient",
      gradientFrom: "#3b82f6",
      gradientTo: "#8b5cf6",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 40 }, content: '"' },
        { type: "text", position: { x: 10, y: 70 }, size: { width: 80, height: 10 }, content: "- Client Name" },
        { type: "logo", position: { x: 40, y: 88 }, size: { width: 20, height: 5 } },
      ],
    },
  },
  {
    id: "testimonial-photo",
    name: "Photo + Quote",
    description: "Client photo with their testimonial overlaid",
    category: "testimonial",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["photo", "quote", "personal"],
    captionTemplate: "Another happy client! Read what they had to say about working together.",
    layout: {
      background: "image",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 100, height: 70 } },
        { type: "text", position: { x: 5, y: 75 }, size: { width: 90, height: 20 } },
      ],
    },
  },

  // Before/After Templates
  {
    id: "before-after-split",
    name: "Side by Side",
    description: "Classic before/after split view",
    category: "beforeAfter",
    platforms: ["instagram", "facebook", "linkedin"],
    format: "feed",
    tags: ["split", "comparison", "editing"],
    captionTemplate: "Before and after from a recent edit. Swipe to see the transformation!",
    hashtagSuggestions: ["#beforeandafter", "#editing", "#photoediting", "#retouching"],
    layout: {
      background: "solid",
      backgroundColor: "#ffffff",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 50, height: 100 } },
        { type: "image", position: { x: 50, y: 0 }, size: { width: 50, height: 100 } },
        { type: "text", position: { x: 5, y: 5 }, size: { width: 15, height: 5 }, content: "BEFORE" },
        { type: "text", position: { x: 80, y: 5 }, size: { width: 15, height: 5 }, content: "AFTER" },
      ],
    },
  },
  {
    id: "before-after-slider",
    name: "Slider Style",
    description: "Mimics an interactive slider comparison",
    category: "beforeAfter",
    platforms: ["instagram"],
    format: "carousel",
    tags: ["slider", "interactive", "carousel"],
    captionTemplate: "Swipe between slides to see the full transformation!",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 100, height: 90 } },
        { type: "shape", position: { x: 49, y: 0 }, size: { width: 2, height: 100 } },
      ],
    },
  },

  // Announcement Templates
  {
    id: "announcement-booking",
    name: "Now Booking",
    description: "Announce your availability for bookings",
    category: "announcement",
    platforms: ["instagram", "facebook", "linkedin"],
    format: "feed",
    tags: ["booking", "availability", "cta"],
    captionTemplate: "Exciting news! I'm now booking for [Season/Month]. Limited spots available - link in bio to reserve yours!",
    hashtagSuggestions: ["#nowbooking", "#booknow", "#photography"],
    layout: {
      background: "gradient",
      gradientFrom: "#22c55e",
      gradientTo: "#16a34a",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 35 }, size: { width: 80, height: 15 }, content: "NOW BOOKING" },
        { type: "text", position: { x: 10, y: 55 }, size: { width: 80, height: 10 }, content: "Spring 2026" },
        { type: "logo", position: { x: 40, y: 80 }, size: { width: 20, height: 5 } },
      ],
    },
  },
  {
    id: "announcement-launch",
    name: "New Service",
    description: "Announce a new service or offering",
    category: "announcement",
    platforms: ["instagram", "linkedin", "twitter"],
    format: "feed",
    tags: ["launch", "new", "service"],
    captionTemplate: "Introducing something new! I'm excited to announce [service]. Stay tuned for more details!",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 10 }, content: "INTRODUCING" },
        { type: "text", position: { x: 10, y: 45 }, size: { width: 80, height: 15 }, content: "New Service" },
        { type: "mockup", position: { x: 20, y: 65 }, size: { width: 60, height: 25 } },
      ],
    },
  },

  // Behind the Scenes Templates
  {
    id: "bts-setup",
    name: "Setup Shot",
    description: "Show your equipment and workspace",
    category: "behindScenes",
    platforms: ["instagram", "tiktok"],
    format: "story",
    tags: ["setup", "gear", "workspace"],
    captionTemplate: "A peek at today's setup! What do you want to know about my gear?",
    hashtagSuggestions: ["#behindthescenes", "#bts", "#photographergear"],
    layout: {
      background: "solid",
      backgroundColor: "#1a1a1a",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 100, height: 85 } },
        { type: "text", position: { x: 10, y: 88 }, size: { width: 80, height: 8 }, content: "BTS" },
      ],
    },
  },
  {
    id: "bts-process",
    name: "Process Breakdown",
    description: "Show your creative process step by step",
    category: "behindScenes",
    platforms: ["instagram"],
    format: "carousel",
    tags: ["process", "tutorial", "breakdown"],
    captionTemplate: "Here's how this shot came together! Swipe to see each step of the process.",
    layout: {
      background: "gradient",
      gradientFrom: "#1e293b",
      gradientTo: "#0f172a",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 10, y: 5 }, size: { width: 80, height: 8 }, content: "Step 1" },
        { type: "image", position: { x: 5, y: 15 }, size: { width: 90, height: 75 } },
      ],
    },
  },

  // Pricing/Promo Templates
  {
    id: "pricing-package",
    name: "Package Reveal",
    description: "Showcase a photography package with pricing",
    category: "pricing",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["pricing", "package", "services"],
    captionTemplate: "Introducing the [Package Name] package! Perfect for [ideal client]. DM for details!",
    hashtagSuggestions: ["#photographypackages", "#pricing", "#booknow"],
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 10 }, content: "THE SIGNATURE PACKAGE" },
        { type: "text", position: { x: 10, y: 35 }, size: { width: 80, height: 35 }, content: "What's included:" },
        { type: "text", position: { x: 10, y: 75 }, size: { width: 80, height: 10 }, content: "Starting at $X" },
        { type: "logo", position: { x: 40, y: 90 }, size: { width: 20, height: 5 } },
      ],
    },
  },
  {
    id: "pricing-sale",
    name: "Limited Offer",
    description: "Promote a limited-time discount or offer",
    category: "pricing",
    platforms: ["instagram", "facebook", "twitter"],
    format: "feed",
    tags: ["sale", "discount", "limited"],
    captionTemplate: "For a limited time only! Don't miss this special offer - ends [date].",
    layout: {
      background: "gradient",
      gradientFrom: "#ef4444",
      gradientTo: "#dc2626",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 20 }, size: { width: 80, height: 15 }, content: "FLASH SALE" },
        { type: "text", position: { x: 10, y: 40 }, size: { width: 80, height: 25 }, content: "20% OFF" },
        { type: "text", position: { x: 10, y: 70 }, size: { width: 80, height: 10 }, content: "Ends Sunday" },
      ],
    },
  },

  // Educational Templates
  {
    id: "educational-tip",
    name: "Quick Tip",
    description: "Share a helpful photography tip",
    category: "educational",
    platforms: ["instagram", "linkedin", "twitter"],
    format: "feed",
    tags: ["tip", "advice", "educational"],
    captionTemplate: "Quick tip for fellow photographers! Save this for later.",
    hashtagSuggestions: ["#photographytips", "#phototips", "#learnphotography"],
    layout: {
      background: "gradient",
      gradientFrom: "#f59e0b",
      gradientTo: "#d97706",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 8 }, content: "PRO TIP" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 50 }, content: "Your tip here" },
        { type: "logo", position: { x: 40, y: 88 }, size: { width: 20, height: 5 } },
      ],
    },
  },
  {
    id: "educational-carousel",
    name: "Tutorial Slides",
    description: "Multi-slide tutorial or guide",
    category: "educational",
    platforms: ["instagram", "linkedin"],
    format: "carousel",
    tags: ["tutorial", "guide", "carousel"],
    captionTemplate: "Save this carousel for your next shoot! Swipe through for the full guide.",
    layout: {
      background: "solid",
      backgroundColor: "#18181b",
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 80, height: 10 }, content: "01" },
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 60 }, content: "Content" },
      ],
    },
  },

  // Milestone Templates
  {
    id: "milestone-followers",
    name: "Follower Milestone",
    description: "Celebrate reaching a follower goal",
    category: "milestone",
    platforms: ["instagram", "twitter"],
    format: "feed",
    tags: ["milestone", "celebration", "followers"],
    captionTemplate: "WOW! We just hit [number] followers! Thank you all for your incredible support!",
    hashtagSuggestions: ["#milestone", "#grateful", "#thankyou"],
    layout: {
      background: "gradient",
      gradientFrom: "#ec4899",
      gradientTo: "#8b5cf6",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 10 }, content: "THANK YOU" },
        { type: "text", position: { x: 10, y: 40 }, size: { width: 80, height: 20 }, content: "10K" },
        { type: "text", position: { x: 10, y: 65 }, size: { width: 80, height: 8 }, content: "FOLLOWERS" },
      ],
    },
  },
  {
    id: "milestone-anniversary",
    name: "Business Anniversary",
    description: "Celebrate your business anniversary",
    category: "milestone",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["anniversary", "celebration", "business"],
    captionTemplate: "[X] years in business! Grateful for every client, project, and moment along the way.",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 20 }, content: "5 YEARS" },
        { type: "text", position: { x: 10, y: 55 }, size: { width: 80, height: 10 }, content: "in business" },
        { type: "logo", position: { x: 40, y: 75 }, size: { width: 20, height: 10 } },
      ],
    },
  },
];

// Helper functions
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesForPlatform(platform: PlatformId): Template[] {
  return TEMPLATES.filter((t) => t.platforms.includes(platform));
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.includes(lowerQuery))
  );
}
