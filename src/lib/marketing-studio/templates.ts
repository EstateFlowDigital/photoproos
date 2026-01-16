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
  | "milestone"
  | "product";

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
  {
    id: "product",
    name: "Product Showcase",
    description: "SaaS-style dashboard & feature highlights",
    icon: "monitor",
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

  // Additional Portfolio Templates
  {
    id: "portfolio-minimal",
    name: "Minimal Portfolio",
    description: "Clean, minimalist design to let your work speak",
    category: "portfolio",
    platforms: ["instagram", "pinterest"],
    format: "feed",
    tags: ["minimal", "clean", "elegant"],
    captionTemplate: "Less is more. New work from a recent session.",
    hashtagSuggestions: ["#minimalism", "#photography", "#cleandesign"],
    layout: {
      background: "solid",
      backgroundColor: "#ffffff",
      elements: [
        { type: "image", position: { x: 10, y: 10 }, size: { width: 80, height: 80 } },
      ],
    },
  },
  {
    id: "portfolio-collage",
    name: "Photo Collage",
    description: "Showcase multiple images in a creative collage",
    category: "portfolio",
    platforms: ["instagram", "facebook", "pinterest"],
    format: "feed",
    tags: ["collage", "multiple", "creative"],
    captionTemplate: "A collection of moments from this session. Which is your favorite?",
    layout: {
      background: "solid",
      backgroundColor: "#1a1a1a",
      elements: [
        { type: "image", position: { x: 5, y: 5 }, size: { width: 55, height: 45 } },
        { type: "image", position: { x: 62, y: 5 }, size: { width: 33, height: 21 } },
        { type: "image", position: { x: 62, y: 28 }, size: { width: 33, height: 21 } },
        { type: "image", position: { x: 5, y: 52 }, size: { width: 44, height: 43 } },
        { type: "image", position: { x: 51, y: 52 }, size: { width: 44, height: 43 } },
      ],
    },
  },

  // Additional Testimonial Templates
  {
    id: "testimonial-video",
    name: "Video Testimonial",
    description: "Perfect for sharing video testimonials",
    category: "testimonial",
    platforms: ["instagram", "tiktok", "facebook"],
    format: "reel",
    tags: ["video", "testimonial", "reel"],
    captionTemplate: "Hear what our clients have to say! Thank you @client for the kind words.",
    hashtagSuggestions: ["#clientreview", "#testimonial", "#happyclients"],
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "image", position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
      ],
    },
  },
  {
    id: "testimonial-stars",
    name: "5-Star Review",
    description: "Highlight a 5-star review with star rating",
    category: "testimonial",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["review", "stars", "rating"],
    captionTemplate: "Another 5-star review! Your kind words mean everything to us.",
    layout: {
      background: "gradient",
      gradientFrom: "#fbbf24",
      gradientTo: "#f59e0b",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 10 }, content: "★★★★★" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 45 }, content: "Quote here" },
        { type: "text", position: { x: 10, y: 80 }, size: { width: 80, height: 8 }, content: "- Client Name" },
      ],
    },
  },

  // Additional Announcement Templates
  {
    id: "announcement-giveaway",
    name: "Giveaway",
    description: "Announce a giveaway or contest",
    category: "announcement",
    platforms: ["instagram", "facebook", "twitter"],
    format: "feed",
    tags: ["giveaway", "contest", "free"],
    captionTemplate: "GIVEAWAY TIME! Win a free [prize]. To enter: 1) Follow us, 2) Like this post, 3) Tag a friend!",
    hashtagSuggestions: ["#giveaway", "#contest", "#win", "#free"],
    layout: {
      background: "gradient",
      gradientFrom: "#8b5cf6",
      gradientTo: "#ec4899",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 15 }, content: "GIVEAWAY" },
        { type: "text", position: { x: 10, y: 45 }, size: { width: 80, height: 10 }, content: "Win a free session!" },
        { type: "text", position: { x: 10, y: 70 }, size: { width: 80, height: 15 }, content: "See caption to enter" },
      ],
    },
  },
  {
    id: "announcement-holiday",
    name: "Holiday Hours",
    description: "Announce holiday schedule or closures",
    category: "announcement",
    platforms: ["instagram", "facebook", "linkedin"],
    format: "feed",
    tags: ["holiday", "hours", "schedule"],
    captionTemplate: "Holiday hours update! We'll be [status] from [dates]. Happy holidays!",
    layout: {
      background: "gradient",
      gradientFrom: "#dc2626",
      gradientTo: "#16a34a",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 10 }, content: "HOLIDAY HOURS" },
        { type: "text", position: { x: 10, y: 40 }, size: { width: 80, height: 30 }, content: "Dec 24-26: Closed" },
        { type: "logo", position: { x: 40, y: 80 }, size: { width: 20, height: 10 } },
      ],
    },
  },

  // Additional Pricing Templates
  {
    id: "pricing-mini-sessions",
    name: "Mini Sessions",
    description: "Promote mini session availability",
    category: "pricing",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["mini", "sessions", "booking"],
    captionTemplate: "Mini sessions are here! Limited spots available for [date]. Book your slot now!",
    hashtagSuggestions: ["#minisessions", "#booking", "#limitedspots"],
    layout: {
      background: "gradient",
      gradientFrom: "#14b8a6",
      gradientTo: "#0891b2",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 20 }, size: { width: 80, height: 15 }, content: "MINI SESSIONS" },
        { type: "text", position: { x: 10, y: 40 }, size: { width: 80, height: 10 }, content: "20 min | 10 images" },
        { type: "text", position: { x: 10, y: 55 }, size: { width: 80, height: 15 }, content: "$199" },
        { type: "text", position: { x: 10, y: 75 }, size: { width: 80, height: 8 }, content: "Book now - link in bio" },
      ],
    },
  },
  {
    id: "pricing-comparison",
    name: "Package Comparison",
    description: "Compare different packages side by side",
    category: "pricing",
    platforms: ["instagram", "linkedin"],
    format: "carousel",
    tags: ["comparison", "packages", "tiers"],
    captionTemplate: "Which package is right for you? Swipe to compare all options. DM for custom quotes!",
    layout: {
      background: "solid",
      backgroundColor: "#18181b",
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 80, height: 10 }, content: "BASIC" },
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 55 }, content: "Features list" },
        { type: "text", position: { x: 10, y: 85 }, size: { width: 80, height: 10 }, content: "$X" },
      ],
    },
  },

  // Additional Educational Templates
  {
    id: "educational-myth",
    name: "Myth Buster",
    description: "Debunk common photography myths",
    category: "educational",
    platforms: ["instagram", "twitter", "linkedin"],
    format: "feed",
    tags: ["myth", "facts", "education"],
    captionTemplate: "MYTH: [common misconception]. FACT: [the truth]. Save this for later!",
    hashtagSuggestions: ["#photographytips", "#mythbusters", "#facts"],
    layout: {
      background: "gradient",
      gradientFrom: "#ef4444",
      gradientTo: "#22c55e",
      gradientAngle: 90,
      elements: [
        { type: "text", position: { x: 5, y: 20 }, size: { width: 45, height: 10 }, content: "MYTH" },
        { type: "text", position: { x: 50, y: 20 }, size: { width: 45, height: 10 }, content: "FACT" },
        { type: "text", position: { x: 5, y: 35 }, size: { width: 45, height: 50 }, content: "Myth text" },
        { type: "text", position: { x: 50, y: 35 }, size: { width: 45, height: 50 }, content: "Fact text" },
      ],
    },
  },
  {
    id: "educational-checklist",
    name: "Session Checklist",
    description: "Share what clients should prepare for their session",
    category: "educational",
    platforms: ["instagram", "pinterest"],
    format: "feed",
    tags: ["checklist", "prep", "clients"],
    captionTemplate: "Getting ready for your photo session? Here's what to bring! Save this checklist.",
    layout: {
      background: "solid",
      backgroundColor: "#1e1b4b",
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 80, height: 10 }, content: "SESSION PREP" },
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 65 }, content: "Checklist items" },
      ],
    },
  },

  // Additional Milestone Templates
  {
    id: "milestone-sessions",
    name: "Sessions Milestone",
    description: "Celebrate completing a number of sessions",
    category: "milestone",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["sessions", "milestone", "achievement"],
    captionTemplate: "Just completed our [number]th session! Thank you to every client who trusted us with their memories.",
    layout: {
      background: "gradient",
      gradientFrom: "#3b82f6",
      gradientTo: "#06b6d4",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 20 }, content: "100+" },
        { type: "text", position: { x: 10, y: 55 }, size: { width: 80, height: 10 }, content: "sessions completed" },
        { type: "logo", position: { x: 40, y: 75 }, size: { width: 20, height: 10 } },
      ],
    },
  },
  {
    id: "milestone-award",
    name: "Award Winner",
    description: "Announce an award or recognition",
    category: "milestone",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["award", "winner", "recognition"],
    captionTemplate: "Honored to announce that we've been recognized as [award name]! Thank you for your support!",
    layout: {
      background: "gradient",
      gradientFrom: "#fbbf24",
      gradientTo: "#f59e0b",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 25 }, size: { width: 80, height: 10 }, content: "AWARD WINNER" },
        { type: "text", position: { x: 10, y: 40 }, size: { width: 80, height: 20 }, content: "Award Name" },
        { type: "text", position: { x: 10, y: 65 }, size: { width: 80, height: 8 }, content: "2026" },
        { type: "logo", position: { x: 40, y: 80 }, size: { width: 20, height: 10 } },
      ],
    },
  },

  // ============================================================================
  // PRODUCT SHOWCASE TEMPLATES - SaaS-style dashboard & feature highlights
  // ============================================================================

  // Pattern 1: Top Text + Bottom Screenshot (like UndWeb example)
  {
    id: "product-headline-screenshot",
    name: "Headline + Screenshot",
    description: "Bold headline with dashboard screenshot below - classic SaaS style",
    category: "product",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["saas", "dashboard", "product", "headline"],
    captionTemplate: "Streamline your photography business with one powerful platform. Link in bio to get started.",
    hashtagSuggestions: ["#saas", "#productlaunch", "#photographybusiness", "#businesstools"],
    layout: {
      background: "gradient",
      gradientFrom: "#0d9488",
      gradientTo: "#14b8a6",
      gradientAngle: 180,
      elements: [
        { type: "logo", position: { x: 10, y: 5 }, size: { width: 15, height: 8 } },
        { type: "text", position: { x: 10, y: 18 }, size: { width: 80, height: 12 }, content: "Ship without the complexity" },
        { type: "text", position: { x: 10, y: 32 }, size: { width: 80, height: 6 }, content: "Turn your workflow into results, no hassle required." },
        { type: "mockup", position: { x: 5, y: 42 }, size: { width: 90, height: 55 } },
      ],
    },
  },
  {
    id: "product-headline-dark",
    name: "Headline Dark Mode",
    description: "Dark theme headline with glowing dashboard screenshot",
    category: "product",
    platforms: ["instagram", "linkedin", "twitter"],
    format: "feed",
    tags: ["saas", "dashboard", "dark", "modern"],
    captionTemplate: "Your entire photography business. One dashboard. Zero complexity.",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "logo", position: { x: 10, y: 5 }, size: { width: 12, height: 6 } },
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 14 }, content: "Run your business smarter" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 70, height: 5 }, content: "Galleries. Invoices. Bookings. All in one place." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 56 } },
      ],
    },
  },
  {
    id: "product-headline-gradient-blue",
    name: "Blue Gradient Hero",
    description: "Professional blue gradient with headline and product preview",
    category: "product",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["saas", "professional", "blue", "gradient"],
    captionTemplate: "Built for professional photographers who mean business.",
    layout: {
      background: "gradient",
      gradientFrom: "#1e40af",
      gradientTo: "#3b82f6",
      gradientAngle: 135,
      elements: [
        { type: "logo", position: { x: 10, y: 6 }, size: { width: 12, height: 6 } },
        { type: "text", position: { x: 10, y: 18 }, size: { width: 80, height: 12 }, content: "The Business OS for Photographers" },
        { type: "text", position: { x: 10, y: 32 }, size: { width: 75, height: 5 }, content: "Deliver galleries. Collect payments. Grow your business." },
        { type: "mockup", position: { x: 8, y: 42 }, size: { width: 84, height: 52 } },
      ],
    },
  },

  // Pattern 2: Metrics Hero - Big numbers with dashboard
  {
    id: "product-metrics-hero",
    name: "Metrics Hero",
    description: "Large metrics numbers with dashboard preview",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "feed",
    tags: ["metrics", "stats", "numbers", "proof"],
    captionTemplate: "Join thousands of photographers already growing with PhotoProOS.",
    layout: {
      background: "solid",
      backgroundColor: "#0f172a",
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 25, height: 15 }, content: "$2.4M+" },
        { type: "text", position: { x: 10, y: 26 }, size: { width: 25, height: 4 }, content: "Revenue processed" },
        { type: "text", position: { x: 40, y: 10 }, size: { width: 25, height: 15 }, content: "15K+" },
        { type: "text", position: { x: 40, y: 26 }, size: { width: 25, height: 4 }, content: "Galleries delivered" },
        { type: "text", position: { x: 70, y: 10 }, size: { width: 20, height: 15 }, content: "99%" },
        { type: "text", position: { x: 70, y: 26 }, size: { width: 20, height: 4 }, content: "Satisfaction" },
        { type: "mockup", position: { x: 5, y: 35 }, size: { width: 90, height: 60 } },
      ],
    },
  },
  {
    id: "product-single-metric",
    name: "Single Metric Focus",
    description: "One powerful metric with supporting dashboard",
    category: "product",
    platforms: ["instagram", "twitter", "linkedin"],
    format: "feed",
    tags: ["metric", "statistic", "impact", "results"],
    captionTemplate: "Real results for real photographers. See what's possible.",
    layout: {
      background: "gradient",
      gradientFrom: "#7c3aed",
      gradientTo: "#a855f7",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 25 }, content: "3x Faster" },
        { type: "text", position: { x: 10, y: 42 }, size: { width: 80, height: 6 }, content: "Deliver galleries in a third of the time" },
        { type: "mockup", position: { x: 10, y: 52 }, size: { width: 80, height: 42 } },
      ],
    },
  },

  // Pattern 3: Split Screen - Text left, dashboard right
  {
    id: "product-split-horizontal",
    name: "Split Horizontal",
    description: "Text on left, dashboard on right - great for LinkedIn",
    category: "product",
    platforms: ["linkedin", "twitter", "facebook"],
    format: "feed",
    tags: ["split", "horizontal", "professional", "clean"],
    captionTemplate: "Everything you need to run your photography business, beautifully organized.",
    layout: {
      background: "solid",
      backgroundColor: "#18181b",
      elements: [
        { type: "text", position: { x: 5, y: 20 }, size: { width: 40, height: 12 }, content: "Your Business Command Center" },
        { type: "text", position: { x: 5, y: 35 }, size: { width: 40, height: 8 }, content: "Invoices, bookings, clients, galleries - all in one dashboard." },
        { type: "text", position: { x: 5, y: 55 }, size: { width: 35, height: 5 }, content: "→ Start free trial" },
        { type: "mockup", position: { x: 48, y: 10 }, size: { width: 48, height: 80 } },
      ],
    },
  },
  {
    id: "product-split-reversed",
    name: "Split Reversed",
    description: "Dashboard on left, text on right",
    category: "product",
    platforms: ["linkedin", "facebook"],
    format: "feed",
    tags: ["split", "reversed", "alternate", "layout"],
    captionTemplate: "See why photographers are switching to PhotoProOS.",
    layout: {
      background: "gradient",
      gradientFrom: "#0f172a",
      gradientTo: "#1e293b",
      gradientAngle: 90,
      elements: [
        { type: "mockup", position: { x: 5, y: 10 }, size: { width: 48, height: 80 } },
        { type: "text", position: { x: 56, y: 25 }, size: { width: 40, height: 10 }, content: "Powerful Analytics" },
        { type: "text", position: { x: 56, y: 38 }, size: { width: 40, height: 12 }, content: "Track revenue, views, and client engagement in real-time." },
        { type: "logo", position: { x: 56, y: 60 }, size: { width: 15, height: 6 } },
      ],
    },
  },

  // Pattern 4: Feature Callout - Specific feature highlighted
  {
    id: "product-feature-galleries",
    name: "Feature: Galleries",
    description: "Highlight the gallery delivery feature",
    category: "product",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["feature", "galleries", "delivery", "clients"],
    captionTemplate: "Stunning galleries that get clients excited. Pay-to-unlock built in.",
    layout: {
      background: "gradient",
      gradientFrom: "#059669",
      gradientTo: "#10b981",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 6 }, content: "FEATURE SPOTLIGHT" },
        { type: "text", position: { x: 10, y: 18 }, size: { width: 80, height: 12 }, content: "Beautiful Client Galleries" },
        { type: "text", position: { x: 10, y: 32 }, size: { width: 80, height: 5 }, content: "Pay-to-unlock. Branded portals. Instant delivery." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 55 } },
      ],
    },
  },
  {
    id: "product-feature-invoicing",
    name: "Feature: Invoicing",
    description: "Highlight the invoicing and payments feature",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "feed",
    tags: ["feature", "invoicing", "payments", "automation"],
    captionTemplate: "Get paid faster with automated invoicing and payment reminders.",
    layout: {
      background: "gradient",
      gradientFrom: "#2563eb",
      gradientTo: "#3b82f6",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 5 }, content: "FEATURE SPOTLIGHT" },
        { type: "text", position: { x: 10, y: 16 }, size: { width: 80, height: 12 }, content: "Automated Invoicing" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 75, height: 6 }, content: "Send invoices. Accept payments. Track everything." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 55 } },
      ],
    },
  },
  {
    id: "product-feature-booking",
    name: "Feature: Booking",
    description: "Highlight the booking and scheduling feature",
    category: "product",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["feature", "booking", "calendar", "scheduling"],
    captionTemplate: "Let clients book you 24/7. Your calendar stays organized automatically.",
    layout: {
      background: "gradient",
      gradientFrom: "#dc2626",
      gradientTo: "#f97316",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 5 }, content: "FEATURE SPOTLIGHT" },
        { type: "text", position: { x: 10, y: 16 }, size: { width: 80, height: 12 }, content: "Smart Booking System" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 75, height: 6 }, content: "Online booking. Automated confirmations. Zero hassle." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 55 } },
      ],
    },
  },
  {
    id: "product-feature-analytics",
    name: "Feature: Analytics",
    description: "Highlight the analytics and reporting feature",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "feed",
    tags: ["feature", "analytics", "reports", "insights"],
    captionTemplate: "Know your numbers. Grow your business. Data-driven decisions made easy.",
    layout: {
      background: "solid",
      backgroundColor: "#0f172a",
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 5 }, content: "FEATURE SPOTLIGHT" },
        { type: "text", position: { x: 10, y: 16 }, size: { width: 80, height: 12 }, content: "Powerful Analytics" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 75, height: 6 }, content: "Revenue trends. Client insights. Growth tracking." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 55 } },
      ],
    },
  },

  // Pattern 5: Story/Vertical Format
  {
    id: "product-story-headline",
    name: "Story: Headline",
    description: "Vertical story format with headline and dashboard",
    category: "product",
    platforms: ["instagram", "facebook", "tiktok"],
    format: "story",
    tags: ["story", "vertical", "mobile", "swipe"],
    captionTemplate: "Swipe up to transform your photography business.",
    layout: {
      background: "gradient",
      gradientFrom: "#6366f1",
      gradientTo: "#8b5cf6",
      gradientAngle: 180,
      elements: [
        { type: "logo", position: { x: 40, y: 5 }, size: { width: 20, height: 5 } },
        { type: "text", position: { x: 10, y: 12 }, size: { width: 80, height: 10 }, content: "Your Business. Simplified." },
        { type: "text", position: { x: 15, y: 23 }, size: { width: 70, height: 4 }, content: "Galleries • Invoices • Bookings" },
        { type: "mockup", position: { x: 5, y: 30 }, size: { width: 90, height: 60 } },
        { type: "text", position: { x: 25, y: 92 }, size: { width: 50, height: 4 }, content: "↑ Swipe up to start free" },
      ],
    },
  },
  {
    id: "product-story-feature",
    name: "Story: Feature Focus",
    description: "Vertical story highlighting a single feature",
    category: "product",
    platforms: ["instagram", "tiktok"],
    format: "story",
    tags: ["story", "feature", "vertical", "focused"],
    captionTemplate: "One feature that changes everything. Swipe up to learn more.",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 5 }, content: "NEW FEATURE" },
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 10 }, content: "Pay-to-Unlock Galleries" },
        { type: "text", position: { x: 10, y: 27 }, size: { width: 80, height: 5 }, content: "Clients preview → Pay → Download" },
        { type: "mockup", position: { x: 5, y: 35 }, size: { width: 90, height: 55 } },
        { type: "text", position: { x: 30, y: 92 }, size: { width: 40, height: 4 }, content: "↑ Try it free" },
      ],
    },
  },
  {
    id: "product-story-metrics",
    name: "Story: Metrics",
    description: "Vertical story with impact metrics",
    category: "product",
    platforms: ["instagram", "facebook"],
    format: "story",
    tags: ["story", "metrics", "proof", "impact"],
    captionTemplate: "Real numbers. Real photographers. Real results.",
    layout: {
      background: "gradient",
      gradientFrom: "#0f766e",
      gradientTo: "#14b8a6",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 20, y: 10 }, size: { width: 60, height: 8 }, content: "Photographers using PhotoProOS" },
        { type: "text", position: { x: 25, y: 22 }, size: { width: 50, height: 15 }, content: "2,500+" },
        { type: "text", position: { x: 20, y: 40 }, size: { width: 60, height: 5 }, content: "Galleries delivered monthly" },
        { type: "text", position: { x: 25, y: 48 }, size: { width: 50, height: 12 }, content: "15K+" },
        { type: "mockup", position: { x: 10, y: 62 }, size: { width: 80, height: 30 } },
        { type: "text", position: { x: 30, y: 94 }, size: { width: 40, height: 3 }, content: "Join them →" },
      ],
    },
  },

  // Pattern 6: Carousel - Multiple screens/features
  {
    id: "product-carousel-features",
    name: "Carousel: Features",
    description: "Multi-slide carousel showcasing different features",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "carousel",
    tags: ["carousel", "features", "multi-slide", "overview"],
    captionTemplate: "Swipe through to see everything PhotoProOS can do for your business →",
    layout: {
      background: "solid",
      backgroundColor: "#0f172a",
      elements: [
        { type: "text", position: { x: 10, y: 8 }, size: { width: 80, height: 4 }, content: "01 / 05" },
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 10 }, content: "Client Galleries" },
        { type: "text", position: { x: 10, y: 27 }, size: { width: 80, height: 6 }, content: "Beautiful, branded galleries with pay-to-unlock built in." },
        { type: "mockup", position: { x: 5, y: 38 }, size: { width: 90, height: 55 } },
        { type: "text", position: { x: 80, y: 95 }, size: { width: 15, height: 3 }, content: "→" },
      ],
    },
  },
  {
    id: "product-carousel-transformation",
    name: "Carousel: Transformation",
    description: "Before/after business transformation story",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "carousel",
    tags: ["carousel", "transformation", "before-after", "journey"],
    captionTemplate: "From chaos to clarity. See the transformation →",
    layout: {
      background: "gradient",
      gradientFrom: "#1e1b4b",
      gradientTo: "#312e81",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 10, y: 12 }, size: { width: 80, height: 6 }, content: "BEFORE PhotoProOS" },
        { type: "text", position: { x: 10, y: 20 }, size: { width: 80, height: 8 }, content: "Spreadsheets. Chaos. Missed payments." },
        { type: "mockup", position: { x: 10, y: 35 }, size: { width: 80, height: 50 } },
        { type: "text", position: { x: 35, y: 90 }, size: { width: 30, height: 4 }, content: "Swipe →" },
      ],
    },
  },

  // Pattern 7: Comparison/Social Proof
  {
    id: "product-comparison",
    name: "Old Way vs New Way",
    description: "Compare the old way of doing things vs your solution",
    category: "product",
    platforms: ["instagram", "linkedin", "twitter"],
    format: "feed",
    tags: ["comparison", "versus", "old-new", "solution"],
    captionTemplate: "Stop doing it the hard way. There's a better approach.",
    layout: {
      background: "solid",
      backgroundColor: "#18181b",
      elements: [
        { type: "text", position: { x: 5, y: 10 }, size: { width: 42, height: 6 }, content: "❌ The Old Way" },
        { type: "text", position: { x: 5, y: 18 }, size: { width: 42, height: 30 }, content: "• Manual invoices\n• Email chains\n• Lost files\n• Missed payments" },
        { type: "text", position: { x: 53, y: 10 }, size: { width: 42, height: 6 }, content: "✓ The PhotoProOS Way" },
        { type: "text", position: { x: 53, y: 18 }, size: { width: 42, height: 30 }, content: "• Auto invoicing\n• Client portal\n• Cloud storage\n• Payment reminders" },
        { type: "mockup", position: { x: 15, y: 55 }, size: { width: 70, height: 40 } },
      ],
    },
  },

  // Pattern 8: CTA Focused
  {
    id: "product-cta-primary",
    name: "CTA: Start Free",
    description: "Strong call-to-action with dashboard teaser",
    category: "product",
    platforms: ["instagram", "facebook", "linkedin"],
    format: "feed",
    tags: ["cta", "conversion", "free-trial", "action"],
    captionTemplate: "Ready to transform your photography business? Start your free trial today.",
    layout: {
      background: "gradient",
      gradientFrom: "#7c3aed",
      gradientTo: "#a855f7",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 12 }, content: "Ready to grow?" },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 80, height: 6 }, content: "Join 2,500+ photographers already using PhotoProOS" },
        { type: "mockup", position: { x: 10, y: 42 }, size: { width: 80, height: 35 } },
        { type: "text", position: { x: 25, y: 82 }, size: { width: 50, height: 8 }, content: "Start Free Trial →" },
      ],
    },
  },
  {
    id: "product-cta-limited",
    name: "CTA: Limited Offer",
    description: "Urgency-driven CTA with special offer",
    category: "product",
    platforms: ["instagram", "facebook"],
    format: "feed",
    tags: ["cta", "urgency", "offer", "limited"],
    captionTemplate: "Limited time: Get 3 months free when you sign up this week.",
    layout: {
      background: "gradient",
      gradientFrom: "#dc2626",
      gradientTo: "#f97316",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 80, height: 6 }, content: "🔥 LIMITED TIME OFFER" },
        { type: "text", position: { x: 10, y: 20 }, size: { width: 80, height: 12 }, content: "3 Months Free" },
        { type: "text", position: { x: 10, y: 35 }, size: { width: 80, height: 5 }, content: "When you sign up this week" },
        { type: "mockup", position: { x: 10, y: 45 }, size: { width: 80, height: 35 } },
        { type: "text", position: { x: 25, y: 85 }, size: { width: 50, height: 6 }, content: "Claim Offer →" },
      ],
    },
  },

  // Pattern 9: Minimalist/Clean
  {
    id: "product-minimal-dark",
    name: "Minimal Dark",
    description: "Ultra-clean dark design with subtle dashboard",
    category: "product",
    platforms: ["instagram", "twitter", "linkedin"],
    format: "feed",
    tags: ["minimal", "dark", "clean", "elegant"],
    captionTemplate: "Simplicity is the ultimate sophistication.",
    layout: {
      background: "solid",
      backgroundColor: "#0a0a0a",
      elements: [
        { type: "logo", position: { x: 42, y: 10 }, size: { width: 16, height: 6 } },
        { type: "text", position: { x: 15, y: 25 }, size: { width: 70, height: 10 }, content: "Photography. Simplified." },
        { type: "mockup", position: { x: 10, y: 40 }, size: { width: 80, height: 50 } },
      ],
    },
  },
  {
    id: "product-minimal-light",
    name: "Minimal Light",
    description: "Clean white design for a professional look",
    category: "product",
    platforms: ["linkedin", "facebook"],
    format: "feed",
    tags: ["minimal", "light", "white", "professional"],
    captionTemplate: "Professional tools for professional photographers.",
    layout: {
      background: "solid",
      backgroundColor: "#ffffff",
      elements: [
        { type: "logo", position: { x: 42, y: 8 }, size: { width: 16, height: 6 } },
        { type: "text", position: { x: 10, y: 22 }, size: { width: 80, height: 10 }, content: "The Business OS for Photographers" },
        { type: "text", position: { x: 20, y: 34 }, size: { width: 60, height: 5 }, content: "Galleries • Invoicing • Booking • Analytics" },
        { type: "mockup", position: { x: 8, y: 44 }, size: { width: 84, height: 50 } },
      ],
    },
  },

  // Pattern 10: Social Proof / Testimonial + Product
  {
    id: "product-testimonial-combo",
    name: "Testimonial + Dashboard",
    description: "Customer quote with product screenshot",
    category: "product",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "feed",
    tags: ["testimonial", "social-proof", "review", "trust"],
    captionTemplate: "Don't just take our word for it. See what photographers are saying.",
    layout: {
      background: "gradient",
      gradientFrom: "#0f172a",
      gradientTo: "#1e293b",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 10, y: 10 }, size: { width: 80, height: 20 }, content: '"PhotoProOS transformed how I run my business. I get paid faster and spend less time on admin."' },
        { type: "text", position: { x: 10, y: 32 }, size: { width: 80, height: 5 }, content: "— Sarah M., Wedding Photographer" },
        { type: "text", position: { x: 10, y: 38 }, size: { width: 20, height: 4 }, content: "★★★★★" },
        { type: "mockup", position: { x: 10, y: 46 }, size: { width: 80, height: 48 } },
      ],
    },
  },

  // Additional variations for different color schemes
  {
    id: "product-purple-gradient",
    name: "Purple Gradient",
    description: "Eye-catching purple gradient with dashboard",
    category: "product",
    platforms: ["instagram", "tiktok"],
    format: "feed",
    tags: ["purple", "gradient", "vibrant", "modern"],
    captionTemplate: "Stand out. Run your business smarter.",
    layout: {
      background: "gradient",
      gradientFrom: "#581c87",
      gradientTo: "#a855f7",
      gradientAngle: 135,
      elements: [
        { type: "text", position: { x: 10, y: 15 }, size: { width: 80, height: 12 }, content: "Your Photos. Your Business." },
        { type: "text", position: { x: 10, y: 30 }, size: { width: 70, height: 5 }, content: "Everything you need in one beautiful platform." },
        { type: "mockup", position: { x: 5, y: 40 }, size: { width: 90, height: 55 } },
      ],
    },
  },
  {
    id: "product-emerald-gradient",
    name: "Emerald Gradient",
    description: "Fresh emerald gradient for growth messaging",
    category: "product",
    platforms: ["instagram", "linkedin"],
    format: "feed",
    tags: ["green", "emerald", "growth", "fresh"],
    captionTemplate: "Grow your photography business with confidence.",
    layout: {
      background: "gradient",
      gradientFrom: "#047857",
      gradientTo: "#34d399",
      gradientAngle: 180,
      elements: [
        { type: "text", position: { x: 10, y: 12 }, size: { width: 80, height: 12 }, content: "Grow Your Business" },
        { type: "text", position: { x: 10, y: 26 }, size: { width: 75, height: 6 }, content: "More bookings. Faster payments. Less stress." },
        { type: "mockup", position: { x: 5, y: 38 }, size: { width: 90, height: 58 } },
      ],
    },
  },
];

// Custom template type (includes isCustom flag and creation date)
export interface CustomTemplate extends Template {
  isCustom: true;
  createdAt: string;
}

// Storage key for custom templates
const CUSTOM_TEMPLATES_KEY = "photoproos-custom-templates";

// Get custom templates from localStorage
export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load custom templates:", error);
    return [];
  }
}

// Save a custom template to localStorage
export function saveCustomTemplate(template: Omit<CustomTemplate, "isCustom" | "createdAt">): CustomTemplate {
  const customTemplates = getCustomTemplates();
  const newTemplate: CustomTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  customTemplates.push(newTemplate);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
  return newTemplate;
}

// Delete a custom template
export function deleteCustomTemplate(id: string): boolean {
  const customTemplates = getCustomTemplates();
  const filtered = customTemplates.filter((t) => t.id !== id);
  if (filtered.length === customTemplates.length) return false;
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

// Update a custom template
export function updateCustomTemplate(id: string, updates: Partial<CustomTemplate>): CustomTemplate | null {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex((t) => t.id === id);
  if (index === -1) return null;
  customTemplates[index] = { ...customTemplates[index], ...updates };
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
  return customTemplates[index];
}

// Helper functions
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  const builtIn = TEMPLATES.filter((t) => t.category === category);
  const custom = getCustomTemplates().filter((t) => t.category === category);
  return [...builtIn, ...custom];
}

export function getTemplateById(id: string): Template | CustomTemplate | undefined {
  // Check built-in templates first
  const builtIn = TEMPLATES.find((t) => t.id === id);
  if (builtIn) return builtIn;
  // Then check custom templates
  return getCustomTemplates().find((t) => t.id === id);
}

export function getTemplatesForPlatform(platform: PlatformId): Template[] {
  const builtIn = TEMPLATES.filter((t) => t.platforms.includes(platform));
  const custom = getCustomTemplates().filter((t) => t.platforms.includes(platform));
  return [...builtIn, ...custom];
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  const searchFn = (t: Template) =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some((tag) => tag.includes(lowerQuery));

  const builtIn = TEMPLATES.filter(searchFn);
  const custom = getCustomTemplates().filter(searchFn);
  return [...builtIn, ...custom];
}

// Get all templates (built-in + custom)
export function getAllTemplates(): (Template | CustomTemplate)[] {
  return [...TEMPLATES, ...getCustomTemplates()];
}
