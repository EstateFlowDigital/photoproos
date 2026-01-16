"use server";

import { db } from "@/lib/db";
import type {
  CMSComponentType,
  CMSComponentCategory,
} from "@prisma/client";

// Re-export types from the client-safe utils file
// NOTE: For utility functions (generateComponentId, createComponentInstance, etc.),
// import directly from "./page-builder-utils" instead
export type {
  ComponentFieldType,
  ComponentField,
  ComponentSchema,
  PageComponentInstance,
  ComponentWithSchema,
} from "./page-builder-utils";

import type { ComponentSchema, ComponentWithSchema } from "./page-builder-utils";

// ============================================================================
// BUILT-IN COMPONENT DEFINITIONS
// ============================================================================

/**
 * Pre-defined component schemas for common page sections
 */
export const COMPONENT_SCHEMAS: Record<CMSComponentType, ComponentSchema> = {
  hero: {
    fields: [
      { name: "headline", label: "Headline", type: "text", required: true },
      { name: "subheadline", label: "Subheadline", type: "textarea" },
      { name: "ctaText", label: "CTA Button Text", type: "text" },
      { name: "ctaLink", label: "CTA Button Link", type: "url" },
      { name: "secondaryCtaText", label: "Secondary CTA Text", type: "text" },
      { name: "secondaryCtaLink", label: "Secondary CTA Link", type: "url" },
      { name: "backgroundImage", label: "Background Image", type: "image" },
      { name: "alignment", label: "Text Alignment", type: "select", options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ]},
    ],
  },
  features_grid: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "columns", label: "Columns", type: "select", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ]},
      {
        name: "features",
        label: "Features",
        type: "array",
        itemSchema: [
          { name: "icon", label: "Icon", type: "icon" },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "link", label: "Link", type: "url" },
        ],
      },
    ],
  },
  features_list: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      {
        name: "features",
        label: "Features",
        type: "array",
        itemSchema: [
          { name: "icon", label: "Icon", type: "icon" },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  testimonials: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "layout", label: "Layout", type: "select", options: [
        { label: "Carousel", value: "carousel" },
        { label: "Grid", value: "grid" },
        { label: "List", value: "list" },
      ]},
      {
        name: "testimonials",
        label: "Testimonials",
        type: "array",
        itemSchema: [
          { name: "quote", label: "Quote", type: "textarea", required: true },
          { name: "author", label: "Author Name", type: "text", required: true },
          { name: "role", label: "Role/Title", type: "text" },
          { name: "company", label: "Company", type: "text" },
          { name: "avatar", label: "Avatar", type: "image" },
          { name: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5 },
        ],
      },
    ],
  },
  faq_accordion: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      {
        name: "faqs",
        label: "FAQs",
        type: "array",
        itemSchema: [
          { name: "question", label: "Question", type: "text", required: true },
          { name: "answer", label: "Answer", type: "richtext", required: true },
        ],
      },
    ],
  },
  cta_section: {
    fields: [
      { name: "headline", label: "Headline", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "primaryCtaText", label: "Primary Button Text", type: "text" },
      { name: "primaryCtaLink", label: "Primary Button Link", type: "url" },
      { name: "secondaryCtaText", label: "Secondary Button Text", type: "text" },
      { name: "secondaryCtaLink", label: "Secondary Button Link", type: "url" },
      { name: "style", label: "Style", type: "select", options: [
        { label: "Default", value: "default" },
        { label: "Gradient", value: "gradient" },
        { label: "Bordered", value: "bordered" },
      ]},
    ],
  },
  stats_metrics: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      {
        name: "stats",
        label: "Statistics",
        type: "array",
        itemSchema: [
          { name: "value", label: "Value", type: "text", required: true },
          { name: "label", label: "Label", type: "text", required: true },
          { name: "prefix", label: "Prefix (e.g., $)", type: "text" },
          { name: "suffix", label: "Suffix (e.g., +, %)", type: "text" },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
    ],
  },
  pricing_table: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "showAnnualToggle", label: "Show Annual/Monthly Toggle", type: "toggle" },
      { name: "highlightPlan", label: "Highlighted Plan Slug", type: "text", helpText: "Slug of plan to highlight" },
      { name: "ctaText", label: "CTA Button Text", type: "text", defaultValue: "Get Started" },
    ],
  },
  team_grid: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "columns", label: "Columns", type: "select", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ]},
      {
        name: "members",
        label: "Team Members",
        type: "array",
        itemSchema: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "role", label: "Role", type: "text" },
          { name: "image", label: "Photo", type: "image" },
          { name: "bio", label: "Bio", type: "textarea" },
          { name: "linkedin", label: "LinkedIn URL", type: "url" },
          { name: "twitter", label: "Twitter URL", type: "url" },
        ],
      },
    ],
  },
  logo_cloud: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "style", label: "Style", type: "select", options: [
        { label: "Grid", value: "grid" },
        { label: "Scrolling", value: "scrolling" },
        { label: "Static Row", value: "row" },
      ]},
      {
        name: "logos",
        label: "Logos",
        type: "array",
        itemSchema: [
          { name: "name", label: "Company Name", type: "text", required: true },
          { name: "image", label: "Logo", type: "image", required: true },
          { name: "link", label: "Website URL", type: "url" },
        ],
      },
    ],
  },
  image_gallery: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "layout", label: "Layout", type: "select", options: [
        { label: "Grid", value: "grid" },
        { label: "Masonry", value: "masonry" },
        { label: "Carousel", value: "carousel" },
      ]},
      { name: "columns", label: "Columns", type: "select", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ]},
      {
        name: "images",
        label: "Images",
        type: "array",
        itemSchema: [
          { name: "src", label: "Image", type: "image", required: true },
          { name: "alt", label: "Alt Text", type: "text" },
          { name: "caption", label: "Caption", type: "text" },
        ],
      },
    ],
  },
  text_block: {
    fields: [
      { name: "content", label: "Content", type: "richtext", required: true },
      { name: "maxWidth", label: "Max Width", type: "select", options: [
        { label: "Small (640px)", value: "sm" },
        { label: "Medium (768px)", value: "md" },
        { label: "Large (1024px)", value: "lg" },
        { label: "Full Width", value: "full" },
      ]},
      { name: "alignment", label: "Alignment", type: "select", options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ]},
    ],
  },
  video_embed: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "videoUrl", label: "Video URL", type: "url", required: true, helpText: "YouTube or Vimeo URL" },
      { name: "thumbnail", label: "Thumbnail", type: "image" },
      { name: "aspectRatio", label: "Aspect Ratio", type: "select", options: [
        { label: "16:9", value: "16/9" },
        { label: "4:3", value: "4/3" },
        { label: "1:1", value: "1/1" },
      ]},
      { name: "autoplay", label: "Autoplay", type: "toggle" },
    ],
  },
  comparison_table: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      {
        name: "columns",
        label: "Columns",
        type: "array",
        itemSchema: [
          { name: "label", label: "Column Label", type: "text", required: true },
          { name: "highlight", label: "Highlight Column", type: "toggle" },
        ],
      },
      {
        name: "rows",
        label: "Rows",
        type: "array",
        itemSchema: [
          { name: "feature", label: "Feature", type: "text", required: true },
          { name: "values", label: "Values (comma-separated)", type: "text", required: true },
        ],
      },
    ],
  },
  timeline: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "orientation", label: "Orientation", type: "select", options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
      ]},
      {
        name: "events",
        label: "Timeline Events",
        type: "array",
        itemSchema: [
          { name: "date", label: "Date/Label", type: "text", required: true },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "icon", label: "Icon", type: "icon" },
          { name: "status", label: "Status", type: "select", options: [
            { label: "Completed", value: "completed" },
            { label: "In Progress", value: "in_progress" },
            { label: "Upcoming", value: "upcoming" },
          ]},
        ],
      },
    ],
  },
  cards_grid: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "columns", label: "Columns", type: "select", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ]},
      {
        name: "cards",
        label: "Cards",
        type: "array",
        itemSchema: [
          { name: "icon", label: "Icon", type: "icon" },
          { name: "image", label: "Image", type: "image" },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "link", label: "Link", type: "url" },
          { name: "linkText", label: "Link Text", type: "text" },
        ],
      },
    ],
  },
  contact_form: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "submitButtonText", label: "Submit Button Text", type: "text", defaultValue: "Send Message" },
      { name: "successMessage", label: "Success Message", type: "textarea" },
      { name: "showName", label: "Show Name Field", type: "toggle", defaultValue: true },
      { name: "showPhone", label: "Show Phone Field", type: "toggle" },
      { name: "showSubject", label: "Show Subject Field", type: "toggle" },
    ],
  },
  newsletter_signup: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "buttonText", label: "Button Text", type: "text", defaultValue: "Subscribe" },
      { name: "placeholder", label: "Email Placeholder", type: "text", defaultValue: "Enter your email" },
      { name: "successMessage", label: "Success Message", type: "text" },
      { name: "style", label: "Style", type: "select", options: [
        { label: "Inline", value: "inline" },
        { label: "Stacked", value: "stacked" },
      ]},
    ],
  },
  social_proof: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "style", label: "Style", type: "select", options: [
        { label: "Avatars Row", value: "avatars" },
        { label: "Stats Bar", value: "stats" },
        { label: "Combined", value: "combined" },
      ]},
      { name: "userCount", label: "User Count", type: "text", placeholder: "10,000+" },
      { name: "rating", label: "Rating", type: "number", min: 1, max: 5 },
      { name: "reviewCount", label: "Review Count", type: "text" },
      {
        name: "avatars",
        label: "User Avatars",
        type: "array",
        itemSchema: [
          { name: "image", label: "Avatar Image", type: "image", required: true },
          { name: "name", label: "Name (for alt text)", type: "text" },
        ],
      },
    ],
  },
  benefits_list: {
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "subtitle", label: "Section Subtitle", type: "textarea" },
      { name: "layout", label: "Layout", type: "select", options: [
        { label: "Two Column", value: "two-column" },
        { label: "Single Column", value: "single" },
        { label: "With Image", value: "with-image" },
      ]},
      { name: "image", label: "Side Image", type: "image" },
      {
        name: "benefits",
        label: "Benefits",
        type: "array",
        itemSchema: [
          { name: "icon", label: "Icon", type: "icon" },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  custom: {
    fields: [
      { name: "html", label: "Custom HTML", type: "richtext" },
      { name: "css", label: "Custom CSS", type: "textarea" },
    ],
  },
};

/**
 * Default content for each component type
 */
export const DEFAULT_COMPONENT_CONTENT: Record<CMSComponentType, Record<string, unknown>> = {
  hero: {
    headline: "Welcome to Our Platform",
    subheadline: "Discover how we can help transform your business",
    ctaText: "Get Started",
    ctaLink: "/signup",
    alignment: "center",
  },
  features_grid: {
    title: "Features",
    subtitle: "Everything you need to succeed",
    columns: "3",
    features: [
      { icon: "zap", title: "Fast", description: "Lightning quick performance" },
      { icon: "shield", title: "Secure", description: "Enterprise-grade security" },
      { icon: "heart", title: "Reliable", description: "99.9% uptime guaranteed" },
    ],
  },
  features_list: {
    title: "Why Choose Us",
    features: [
      { icon: "check", title: "Easy to Use", description: "Intuitive interface" },
      { icon: "check", title: "Powerful", description: "Advanced features" },
    ],
  },
  testimonials: {
    title: "What Our Customers Say",
    layout: "carousel",
    testimonials: [
      { quote: "Amazing product!", author: "John Doe", company: "Acme Inc", rating: 5 },
    ],
  },
  faq_accordion: {
    title: "Frequently Asked Questions",
    faqs: [
      { question: "How do I get started?", answer: "Simply sign up for a free account." },
    ],
  },
  cta_section: {
    headline: "Ready to get started?",
    description: "Join thousands of satisfied customers today.",
    primaryCtaText: "Start Free Trial",
    primaryCtaLink: "/signup",
    style: "default",
  },
  stats_metrics: {
    title: "By the Numbers",
    stats: [
      { value: "10K+", label: "Customers" },
      { value: "99.9%", label: "Uptime" },
      { value: "24/7", label: "Support" },
    ],
  },
  pricing_table: {
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the plan that's right for you",
    showAnnualToggle: true,
    ctaText: "Get Started",
  },
  team_grid: {
    title: "Meet Our Team",
    columns: "3",
    members: [],
  },
  logo_cloud: {
    title: "Trusted By",
    style: "row",
    logos: [],
  },
  image_gallery: {
    title: "Gallery",
    layout: "grid",
    columns: "3",
    images: [],
  },
  text_block: {
    content: "<p>Add your content here...</p>",
    maxWidth: "lg",
    alignment: "left",
  },
  video_embed: {
    title: "Watch Our Demo",
    videoUrl: "",
    aspectRatio: "16/9",
    autoplay: false,
  },
  comparison_table: {
    title: "Compare Plans",
    columns: [
      { label: "Feature", highlight: false },
      { label: "Basic", highlight: false },
      { label: "Pro", highlight: true },
    ],
    rows: [],
  },
  timeline: {
    title: "Our Journey",
    orientation: "vertical",
    events: [],
  },
  cards_grid: {
    title: "Explore",
    columns: "3",
    cards: [],
  },
  contact_form: {
    title: "Get in Touch",
    subtitle: "We'd love to hear from you",
    submitButtonText: "Send Message",
    showName: true,
    showPhone: false,
    showSubject: true,
  },
  newsletter_signup: {
    title: "Stay Updated",
    description: "Subscribe to our newsletter for the latest updates",
    buttonText: "Subscribe",
    placeholder: "Enter your email",
    style: "inline",
  },
  social_proof: {
    title: "Join Thousands of Happy Users",
    style: "combined",
    userCount: "10,000+",
    rating: 5,
    avatars: [],
  },
  benefits_list: {
    title: "Why Choose Us",
    layout: "two-column",
    benefits: [],
  },
  custom: {
    html: "",
    css: "",
  },
};

/**
 * Component category metadata
 */
export const COMPONENT_CATEGORIES: Record<CMSComponentCategory, { label: string; description: string }> = {
  hero: { label: "Hero Sections", description: "Page headers and hero banners" },
  content: { label: "Content", description: "Text, images, and media content" },
  social: { label: "Social Proof", description: "Testimonials, logos, and reviews" },
  conversion: { label: "Conversion", description: "CTAs, forms, and pricing" },
  navigation: { label: "Navigation", description: "Navigation and menu elements" },
  data: { label: "Data Display", description: "Tables, timelines, and comparisons" },
  custom: { label: "Custom", description: "Custom HTML and components" },
};

/**
 * Map component types to their categories
 */
export const COMPONENT_TYPE_CATEGORY: Record<CMSComponentType, CMSComponentCategory> = {
  hero: "hero",
  features_grid: "content",
  features_list: "content",
  testimonials: "social",
  faq_accordion: "content",
  cta_section: "conversion",
  stats_metrics: "data",
  pricing_table: "conversion",
  team_grid: "content",
  logo_cloud: "social",
  image_gallery: "content",
  text_block: "content",
  video_embed: "content",
  comparison_table: "data",
  timeline: "data",
  cards_grid: "content",
  contact_form: "conversion",
  newsletter_signup: "conversion",
  social_proof: "social",
  benefits_list: "content",
  custom: "custom",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get component schema for a type (async to satisfy server action requirements)
 */
export async function getComponentSchema(type: CMSComponentType): Promise<ComponentSchema> {
  return COMPONENT_SCHEMAS[type];
}

/**
 * Get default content for a type (async to satisfy server action requirements)
 */
export async function getDefaultContent(type: CMSComponentType): Promise<Record<string, unknown>> {
  return DEFAULT_COMPONENT_CONTENT[type];
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Get all active components from database
 */
export async function getComponents(): Promise<ComponentWithSchema[]> {
  const components = await db.cMSComponent.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return components.map((c) => ({
    ...c,
    schema: c.schema as ComponentSchema,
    defaultContent: c.defaultContent as Record<string, unknown>,
  }));
}

/**
 * Get component by slug
 */
export async function getComponentBySlug(slug: string): Promise<ComponentWithSchema | null> {
  const component = await db.cMSComponent.findUnique({
    where: { slug },
  });

  if (!component) return null;

  return {
    ...component,
    schema: component.schema as ComponentSchema,
    defaultContent: component.defaultContent as Record<string, unknown>,
  };
}

/**
 * Get components grouped by category
 */
export async function getComponentsByCategory(): Promise<
  Record<CMSComponentCategory, ComponentWithSchema[]>
> {
  const components = await getComponents();

  const grouped = {
    hero: [],
    content: [],
    social: [],
    conversion: [],
    navigation: [],
    data: [],
    custom: [],
  } as Record<CMSComponentCategory, ComponentWithSchema[]>;

  for (const component of components) {
    grouped[component.category].push(component);
  }

  return grouped;
}

/**
 * Seed default components into database
 */
export async function seedDefaultComponents(): Promise<void> {
  const componentDefs: {
    name: string;
    slug: string;
    description: string;
    type: CMSComponentType;
    icon: string;
  }[] = [
    { name: "Hero Section", slug: "hero", description: "Page hero with headline and CTA", type: "hero", icon: "layout" },
    { name: "Features Grid", slug: "features-grid", description: "Grid of feature cards", type: "features_grid", icon: "grid" },
    { name: "Features List", slug: "features-list", description: "List of features with icons", type: "features_list", icon: "list" },
    { name: "Testimonials", slug: "testimonials", description: "Customer testimonials", type: "testimonials", icon: "message-square" },
    { name: "FAQ Accordion", slug: "faq-accordion", description: "Expandable FAQ section", type: "faq_accordion", icon: "help-circle" },
    { name: "CTA Section", slug: "cta-section", description: "Call-to-action block", type: "cta_section", icon: "mouse-pointer" },
    { name: "Stats & Metrics", slug: "stats-metrics", description: "Statistics display", type: "stats_metrics", icon: "bar-chart" },
    { name: "Pricing Table", slug: "pricing-table", description: "Pricing tiers display", type: "pricing_table", icon: "credit-card" },
    { name: "Team Grid", slug: "team-grid", description: "Team member grid", type: "team_grid", icon: "users" },
    { name: "Logo Cloud", slug: "logo-cloud", description: "Partner/client logos", type: "logo_cloud", icon: "image" },
    { name: "Image Gallery", slug: "image-gallery", description: "Image gallery", type: "image_gallery", icon: "images" },
    { name: "Text Block", slug: "text-block", description: "Rich text content", type: "text_block", icon: "file-text" },
    { name: "Video Embed", slug: "video-embed", description: "Video player embed", type: "video_embed", icon: "play-circle" },
    { name: "Comparison Table", slug: "comparison-table", description: "Feature comparison", type: "comparison_table", icon: "table" },
    { name: "Timeline", slug: "timeline", description: "Timeline display", type: "timeline", icon: "clock" },
    { name: "Cards Grid", slug: "cards-grid", description: "Generic card grid", type: "cards_grid", icon: "squares" },
    { name: "Contact Form", slug: "contact-form", description: "Contact form section", type: "contact_form", icon: "mail" },
    { name: "Newsletter Signup", slug: "newsletter-signup", description: "Newsletter signup", type: "newsletter_signup", icon: "send" },
    { name: "Social Proof", slug: "social-proof", description: "Social proof section", type: "social_proof", icon: "star" },
    { name: "Benefits List", slug: "benefits-list", description: "Benefits/value props", type: "benefits_list", icon: "check-circle" },
    { name: "Custom HTML", slug: "custom", description: "Custom HTML content", type: "custom", icon: "code" },
  ];

  for (let i = 0; i < componentDefs.length; i++) {
    const def = componentDefs[i];
    await db.cMSComponent.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        type: def.type,
        category: COMPONENT_TYPE_CATEGORY[def.type],
        schema: COMPONENT_SCHEMAS[def.type],
        defaultContent: DEFAULT_COMPONENT_CONTENT[def.type],
        icon: def.icon,
        sortOrder: i,
        isActive: true,
      },
    });
  }
}
